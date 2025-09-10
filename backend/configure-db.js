#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

console.log('🔧 Configuration de la base de données PostgreSQL');
console.log('================================================\n');

console.log('Pour obtenir votre DATABASE_URL depuis Railway:');
console.log('1. Allez sur railway.app et connectez-vous');
console.log('2. Sélectionnez votre projet');
console.log('3. Cliquez sur votre service PostgreSQL');
console.log('4. Dans l\'onglet "Variables", copiez la valeur de DATABASE_URL\n');

rl.question('Collez votre DATABASE_URL ici: ', (databaseUrl) => {
  if (!databaseUrl || !databaseUrl.startsWith('postgresql://')) {
    console.log('❌ URL invalide. Elle doit commencer par postgresql://');
    rl.close();
    return;
  }

  const envContent = `# Configuration de la base de données PostgreSQL
DATABASE_URL=${databaseUrl}

# Port du serveur
PORT=3001
`;

  const envPath = path.join(__dirname, '.env');
  
  try {
    fs.writeFileSync(envPath, envContent);
    console.log('✅ Fichier .env créé avec succès!');
    console.log('\n🚀 Vous pouvez maintenant exécuter:');
    console.log('node scripts/setup-database.js');
  } catch (error) {
    console.error('❌ Erreur lors de la création du .env:', error.message);
  }
  
  rl.close();
});
