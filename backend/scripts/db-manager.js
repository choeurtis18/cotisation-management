#!/usr/bin/env node

const { setupDatabase } = require('./setup-database');
const { migrateJsonToPostgres } = require('./migrate-json-to-postgres');
const { backupPostgresToJson } = require('./backup-postgres-to-json');

// Script utilitaire pour gérer la base de données
const showHelp = () => {
  console.log('🛠️  Gestionnaire de base de données PostgreSQL');
  console.log('===============================================\n');
  console.log('Commandes disponibles:');
  console.log('  setup     - Initialiser les tables PostgreSQL');
  console.log('  migrate   - Migrer les données JSON vers PostgreSQL');
  console.log('  backup    - Sauvegarder PostgreSQL vers JSON');
  console.log('  help      - Afficher cette aide\n');
  console.log('Exemples:');
  console.log('  node scripts/db-manager.js setup');
  console.log('  node scripts/db-manager.js migrate');
  console.log('  node scripts/db-manager.js backup');
};

const main = async () => {
  const command = process.argv[2];

  switch (command) {
    case 'setup':
      await setupDatabase();
      break;
    
    case 'migrate':
      await migrateJsonToPostgres();
      break;
    
    case 'backup':
      await backupPostgresToJson();
      break;
    
    case 'help':
    case '--help':
    case '-h':
      showHelp();
      break;
    
    default:
      console.log('❌ Commande inconnue:', command || '(aucune)');
      console.log('');
      showHelp();
      process.exit(1);
  }
};

// Exécuter le script si appelé directement
if (require.main === module) {
  main().catch(error => {
    console.error('❌ Erreur:', error.message);
    process.exit(1);
  });
}

module.exports = { main };
