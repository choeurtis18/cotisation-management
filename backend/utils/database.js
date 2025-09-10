const { Pool } = require('pg');

// Configuration de la connexion PostgreSQL
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_URL ? { rejectUnauthorized: false } : false
});

// Test de connexion
const testConnection = async () => {
  try {
    const client = await pool.connect();
    console.log('✅ Connexion PostgreSQL réussie');
    client.release();
    return true;
  } catch (err) {
    console.error('❌ Erreur connexion PostgreSQL:', err.message);
    return false;
  }
};

// Fonction utilitaire pour exécuter des requêtes
const query = async (text, params) => {
  const start = Date.now();
  try {
    const res = await pool.query(text, params);
    const duration = Date.now() - start;
    console.log('🔍 Query executed', { text, duration, rows: res.rowCount });
    return res;
  } catch (err) {
    console.error('❌ Database query error:', err);
    throw err;
  }
};

// Fonction pour obtenir un client avec transaction
const getClient = async () => {
  return await pool.connect();
};

module.exports = {
  query,
  getClient,
  testConnection,
  pool
};
