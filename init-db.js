import pkg from 'pg';
const { Pool } = pkg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

const createTables = async () => {
  const client = await pool.connect();
  try {
    await client.query(`
      -- Crear tabla usuarios
      CREATE TABLE usuarios (
          id SERIAL PRIMARY KEY,
          nombre_usuario VARCHAR(50) UNIQUE NOT NULL,
          contraseña VARCHAR(255) NOT NULL,
          rol VARCHAR(20) NOT NULL CHECK (rol IN ('admin', 'usuario')),
          fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      -- Crear tabla maquinas
      CREATE TABLE maquinas (
          id SERIAL PRIMARY KEY,
          codigo VARCHAR(10) UNIQUE NOT NULL CHECK (codigo ~ '^[A-Z0-9]+$'),
          nombre VARCHAR(100) NOT NULL,
          descripcion TEXT,
          seccion VARCHAR(50) NOT NULL,
          ubicacion VARCHAR(100),
          fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      -- Crear tabla fallos
      CREATE TABLE fallos (
          id SERIAL PRIMARY KEY,
          maquina_id INTEGER REFERENCES maquinas(id),
          codigo VARCHAR(20) UNIQUE NOT NULL,
          mensaje VARCHAR(200) NOT NULL,
          causa TEXT NOT NULL,
          consecuencia TEXT NOT NULL,
          accion TEXT NOT NULL,
          fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      -- Crear tabla comentarios
      CREATE TABLE comentarios (
          id SERIAL PRIMARY KEY,
          fallo_id INTEGER REFERENCES fallos(id),
          usuario_id INTEGER REFERENCES usuarios(id),
          contenido TEXT NOT NULL,
          fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      -- Insertar usuario admin por defecto
      INSERT INTO usuarios (nombre_usuario, contraseña, rol)
      VALUES ('admin', 'serac123', 'admin');
    `);
    console.log('Tablas creadas exitosamente');
  } catch (error) {
    console.error('Error al crear las tablas:', error);
  } finally {
    client.release();
    await pool.end();
  }
};

createTables();
