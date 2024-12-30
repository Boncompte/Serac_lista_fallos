import pkg from 'pg';
const { Pool } = pkg;
import dotenv from 'dotenv';

dotenv.config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

const createTables = async () => {
  const client = await pool.connect();
  try {
    // Iniciar transacción
    await client.query('BEGIN');

    console.log('Creando tablas...');

    // Crear tabla usuarios
    await client.query(`
      CREATE TABLE IF NOT EXISTS usuarios (
          id SERIAL PRIMARY KEY,
          nombre_usuario VARCHAR(50) UNIQUE NOT NULL,
          contraseña VARCHAR(255) NOT NULL,
          rol VARCHAR(20) NOT NULL CHECK (rol IN ('admin', 'usuario')),
          fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('Tabla usuarios creada');

    // Crear tabla maquinas
    await client.query(`
      CREATE TABLE IF NOT EXISTS maquinas (
          id SERIAL PRIMARY KEY,
          codigo VARCHAR(10) UNIQUE NOT NULL CHECK (codigo ~ '^[A-Z0-9]+$'),
          nombre VARCHAR(100) NOT NULL,
          descripcion TEXT,
          seccion VARCHAR(50) NOT NULL,
          ubicacion VARCHAR(100),
          fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('Tabla maquinas creada');

    // Crear tabla fallos
    await client.query(`
      CREATE TABLE IF NOT EXISTS fallos (
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
    `);
    console.log('Tabla fallos creada');

    // Crear tabla comentarios
    await client.query(`
      CREATE TABLE IF NOT EXISTS comentarios (
          id SERIAL PRIMARY KEY,
          fallo_id INTEGER REFERENCES fallos(id),
          usuario_id INTEGER REFERENCES usuarios(id),
          contenido TEXT NOT NULL,
          fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('Tabla comentarios creada');

    // Insertar usuario admin por defecto
    await client.query(`
      INSERT INTO usuarios (nombre_usuario, contraseña, rol)
      VALUES ('admin', 'serac123', 'admin')
      ON CONFLICT (nombre_usuario) DO NOTHING;
    `);
    console.log('Usuario admin creado');

    // Confirmar transacción
    await client.query('COMMIT');
    console.log('Base de datos inicializada correctamente');

  } catch (error) {
    // Revertir cambios si hay error
    await client.query('ROLLBACK');
    console.error('Error al inicializar la base de datos:', error);
    throw error;
  } finally {
    // Liberar el cliente
    client.release();
    await pool.end();
  }
};

// Ejecutar la inicialización
createTables().catch(console.error);
