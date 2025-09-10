const fs = require('fs');
const path = require('path');
const { query, testConnection } = require('../utils/database');

// Script pour initialiser la base de données PostgreSQL
const setupDatabase = async () => {
  console.log('🚀 Initialisation de la base de données PostgreSQL...');
  
  try {
    // Test de connexion
    const connected = await testConnection();
    if (!connected) {
      console.error('❌ Impossible de se connecter à PostgreSQL');
      console.log('💡 Assurez-vous que PostgreSQL est installé et en cours d\'exécution');
      console.log('💡 Ou configurez DATABASE_URL dans le .env');
      process.exit(1);
    }

    // Lire le fichier schema.sql
    const schemaPath = path.join(__dirname, '../migrations/schema.sql');
    const schema = fs.readFileSync(schemaPath, 'utf8');

    // Exécuter le schéma
    console.log('📋 Création des tables...');
    await query(schema);
    
    console.log('✅ Base de données initialisée avec succès !');
    console.log('📊 Tables créées : adherents, cotisations, cotisations_mensuelles');
    
    // Vérifier les tables créées
    const result = await query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name;
    `);
    
    console.log('🔍 Tables disponibles :');
    result.rows.forEach(row => {
      console.log(`  - ${row.table_name}`);
    });

  } catch (error) {
    console.error('❌ Erreur lors de l\'initialisation :', error.message);
    process.exit(1);
  }
  
  process.exit(0);
};

// Exécuter le script si appelé directement
if (require.main === module) {
  setupDatabase();
}

module.exports = { setupDatabase };
