import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import jwt from 'jsonwebtoken';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(express.json());
const port = process.env.PORT || 3000;

// Clave secreta para JWT (en producción debería estar en variables de entorno)
const JWT_SECRET = 'serac-secret-key';

// Usuario de admin (en producción debería estar en base de datos)
const ADMIN_USER = {
  username: 'admin',
  password: 'serac123'  // En producción debería estar hasheada
};

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
  
  if (username === ADMIN_USER.username && password === ADMIN_USER.password) {
    const token = jwt.sign({ username }, JWT_SECRET, { expiresIn: '1h' });
    res.json({ token });
  } else {
    res.status(401).json({ error: 'Credenciales inválidas' });
  }
});

// Verificar token
app.get('/api/verify-token', authenticateToken, (req, res) => {
  res.json({ valid: true });
});

// Rutas públicas
app.get('/api/faults', (req, res) => {
  const faults = [
    {
      code: 'def0001',
      message: 'Parada de emergencia',
      cause: 'Un operador ha activado uno de los botones "pulsador de paro" en la máquina',
      consequence: 'Los suministros energéticos se cortan',
      action: 'Corregir según el fallo y rearmar el pulsador'
    }
  ];
  res.json(faults);
});

// Rutas protegidas
app.post('/api/faults', authenticateToken, (req, res) => {
  // Aquí añadiremos la lógica para crear nuevos fallos
  res.json({ message: 'Fallo añadido correctamente' });
});

// Servir el index.html para todas las rutas no-API
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
