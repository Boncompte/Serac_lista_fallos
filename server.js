import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = process.env.PORT || 3000;

// Servir archivos estáticos
app.use(express.static(path.join(__dirname, 'public')));

// API endpoints
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

// Servir el index.html para todas las rutas no-API
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
