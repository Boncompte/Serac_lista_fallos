import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import jwt from 'jsonwebtoken';
import dbPromise from './database.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(express.json());
const port = process.env.PORT || 3000;

// Clave secreta para JWT
const JWT_SECRET = 'serac-secret-key';

// Lista de usuarios admin (temporal, luego irá a la base de datos)
const ADMIN_USERS = [
  {
    username: 'admin',
    password: 'serac123'
  },
  {
    username: 'Admin',
    password: 'Serac123'
  }
];

// Middleware para verificar JWT
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) return res.status(401).json({ error: 'Token requerido' });

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ error: 'Token inválido' });
    req.user = user;
    next();
  });
};

// Servir archivos estáticos
app.use(express.static(path.join(__dirname, 'public')));

// Ruta de login
app.post('/api/login', (req, res) => {
  const { username, password } = req.body;
  
  const user = ADMIN_USERS.find(
    u => u.username === username && u.password === password
  );
  
  if (user) {
    const token = jwt.sign({ username }, JWT_SECRET, { expiresIn: '1h' });
    res.json({ token });
  } else {
    res.status(401).json({ error: 'Credenciales inválidas' });
  }
});

// Obtener todos los fallos
app.get('/api/faults', async (req, res) => {
  try {
    const db = await dbPromise;
    const faults = await db.all('SELECT * FROM faults ORDER BY code');
    res.json(faults);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Error al obtener los fallos' });
  }
});

// Crear nuevo fallo
app.post('/api/faults', authenticateToken, async (req, res) => {
  try {
    const { code, message, cause, consequence, action } = req.body;
    const db = await dbPromise;
    
    // Verificar si el código ya existe
    const existing = await db.get('SELECT code FROM faults WHERE code = ?', code);
    if (existing) {
      return res.status(400).json({ error: 'El código ya existe' });
    }

    await db.run(
      `INSERT INTO faults (code, message, cause, consequence, action) 
       VALUES (?, ?, ?, ?, ?)`,
      [code, message, cause, consequence, action]
    );

    res.json({ message: 'Fallo añadido correctamente' });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Error al crear el fallo' });
  }
});

// Actualizar fallo
app.put('/api/faults/:code', authenticateToken, async (req, res) => {
  try {
    const { code } = req.params;
    const { message, cause, consequence, action } = req.body;
    const db = await dbPromise;

    const result = await db.run(
      `UPDATE faults 
       SET message = ?, cause = ?, consequence = ?, action = ?, updated_at = CURRENT_TIMESTAMP
       WHERE code = ?`,
      [message, cause, consequence, action, code]
    );

    if (result.changes === 0) {
      return res.status(404).json({ error: 'Fallo no encontrado' });
    }

    res.json({ message: 'Fallo actualizado correctamente' });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Error al actualizar el fallo' });
  }
});

// Eliminar fallo
app.delete('/api/faults/:code', authenticateToken, async (req, res) => {
  try {
    const { code } = req.params;
    const db = await dbPromise;

    const result = await db.run('DELETE FROM faults WHERE code = ?', code);

    if (result.changes === 0) {
      return res.status(404).json({ error: 'Fallo no encontrado' });
    }

    res.json({ message: 'Fallo eliminado correctamente' });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Error al eliminar el fallo' });
  }
});

// Servir el index.html para todas las rutas no-API
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
