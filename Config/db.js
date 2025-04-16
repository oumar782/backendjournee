// db.js
require('dotenv').config();
const { Pool } = require('pg');

// Connexion via Pool PostgreSQL
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

// Test de connexion
pool.query('SELECT NOW()', (err, res) => {
  if (err) {
    console.error('❌ Erreur connexion PostgreSQL :', err);
  } else {
    console.log('✅ Connecté à PostgreSQL avec succès à', res.rows[0].now);
  }
});

module.exports = pool;
