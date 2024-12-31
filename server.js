import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import supabase from './supabase.js';

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
    const { data, error } = await supabase
      .from('fallos')
      .select('*');

    if (error) throw error;
    res.json(data);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Error al obtener los fallos' });
  }
});

// Ruta de login
app.post('/api/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw error;

    // Obtener el rol del usuario
    const { data: userData, error: userError } = await supabase
      .from('usuarios')
      .select('rol')
      .eq('id', data.user.id)
      .single();

    if (userError) throw userError;

    res.json({
      token: data.session.access_token,
      role: userData.rol
    });
  } catch (error) {
    console.error('Error:', error);
    res.status(401).json({ error: 'Credenciales inválidas' });
  }
});

// Middleware para verificar token
const authenticateToken = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Token requerido' });
  }

  try {
    const { data: { user }, error } = await supabase.auth.getUser(token);
    if (error) throw error;
    req.user = user;
    next();
  } catch (error) {
    console.error('Error:', error);
    return res.status(403).json({ error: 'Token inválido' });
  }
};

// Rutas protegidas
app.post('/api/faults', authenticateToken, async (req, res) => {
  try {
    const { code, message, cause, consequence, action } = req.body;
    const { data, error } = await supabase
      .from('fallos')
      .insert([
        {
          codigo: code,
          mensaje: message,
          causa: cause,
          consecuencia: consequence,
          accion: action
        }
      ])
      .select();

    if (error) throw error;
    res.json(data[0]);
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
