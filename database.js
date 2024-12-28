import sqlite3 from 'sqlite3';
import { open } from 'sqlite';

// Función para inicializar la base de datos
async function initializeDB() {
  const db = await open({
    filename: 'serac_faults.db',
    driver: sqlite3.Database
  });

  // Crear tabla de fallos
  await db.exec(`
    CREATE TABLE IF NOT EXISTS faults (
      code TEXT PRIMARY KEY,
      message TEXT NOT NULL,
      cause TEXT NOT NULL,
      consequence TEXT NOT NULL,
      action TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Crear tabla de usuarios (para futura gestión de usuarios)
  await db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  return db;
}

// Exportar una instancia de la base de datos
const dbPromise = initializeDB();

export default dbPromise;
