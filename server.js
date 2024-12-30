import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import jwt from 'jsonwebtoken';
import pool from './database.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(express.json());
const port = process.env.PORT || 3000;

// Servir archivos estáticos
app.use(express.static(path.join(__dirname, 'public')));

// API endpoints
app.get('/api/faults', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM fallos');
    res.json(result.rows);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Error al obtener los fallos' });
  }
});

// Ruta de login
app.post('/api/login', async (req, res) => {
  const { username, password } = req.body;
  try {
    const result = await pool.query(
      'SELECT * FROM usuarios WHERE nombre_usuario = $1 AND contraseña = $2',
      [username, password]
    );
    
    if (result.rows.length > 0) {
      const token = jwt.sign(
        { username, role: result.rows[0].rol },
        process.env.JWT_SECRET,
        { expiresIn: '1h' }
      );
      res.json({ token });
    } else {
      res.status(401).json({ error: 'Credenciales inválidas' });
    }
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Error en el servidor' });
  }
});

// Verificar token
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) return res.status(401).json({ error: 'Token requerido' });

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ error: 'Token inválido' });
    req.user = user;
    next();
  });
};

// Rutas protegidas
app.post('/api/faults', authenticateToken, async (req, res) => {
  try {
    const { code, message, cause, consequence, action } = req.body;
    const result = await pool.query(
      'INSERT INTO fallos (codigo, mensaje, causa, consecuencia, accion) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [code, message, cause, consequence, action]
    );
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Error al crear el fallo' });
  }
});

// Servir el index.html para todas las rutas no-API
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
