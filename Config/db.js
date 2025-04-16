// db.js
require('dotenv').config();
const { Pool } = require('pg');
import postgres from 'postgres';
// Pool PostgreSQL avec configuration .env
const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT || 5432,
  ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false
  
});

const sql = postgres(process.env.DATABASE_URL, {
  ssl: 'require'
});
// Test de connexion
pool.query('SELECT NOW()', (err) => {
  if (err) {
    console.error('❌ Erreur connexion PostgreSQL :', err);
  } else {
    console.log('✅ Connecté à PostgreSQL avec succès');
  }
});

module.exports = pool;
