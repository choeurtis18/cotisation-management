const express = require('express');
const cors = require('cors');
const path = require('path');
const fileManager = require('./utils/fileManager');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Import routes
const adherentsRoutes = require('./routes/adherents');
const cotisationsRoutes = require('./routes/cotisations');
const cotisationsMensuellesRoutes = require('./routes/cotisations-mensuelles');
const exportRoutes = require('./routes/export');

// Initialize data files
const initializeDataFiles = () => {
  console.log('Initialisation des fichiers de données...');
  
  // Vérifier et créer les fichiers JSON s'ils n'existent pas
  const adherentsData = fileManager.readJSON('adherents.json');
  const cotisationsData = fileManager.readJSON('cotisations.json');
  const cotisationsMensuellesData = fileManager.readJSON('cotisations-mensuelles.json');

  if (!adherentsData) {
    console.log('Création du fichier adherents.json');
    fileManager.initializeFile('adherents.json', { adherents: [] });
  }

  if (!cotisationsData) {
    console.log('Création du fichier cotisations.json');
    fileManager.initializeFile('cotisations.json', { cotisations: [] });
  }

  if (!cotisationsMensuellesData) {
    console.log('Création du fichier cotisations-mensuelles.json');
    fileManager.initializeFile('cotisations-mensuelles.json', { cotisationsMensuelles: [] });
  }

  console.log('Fichiers de données initialisés avec succès');
};

// Routes
app.use('/api/adherents', adherentsRoutes);
app.use('/api/cotisations', cotisationsRoutes);
app.use('/api/cotisations-mensuelles', cotisationsMensuellesRoutes);
app.use('/api/export', exportRoutes);

// Routes spéciales pour les relations
const cotisationsMensuellesController = require('./controllers/cotisationsMensuellesController');
app.get('/api/adherents/:id/cotisations/:annee', cotisationsMensuellesController.getCotisationsAdherentByYear);
app.get('/api/cotisations/:id/mensuelles/:annee', cotisationsMensuellesController.getCotisationsMensuellesByCotisationAndYear);

// Route de test
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Backend Cotisations Management API',
    timestamp: new Date().toISOString()
  });
});

// Route par défaut
app.get('/', (req, res) => {
  res.json({ 
    message: 'API Backend - Dashboard Cotisations Management',
    version: '1.0.0',
    endpoints: {
      health: '/api/health',
      adherents: '/api/adherents',
      cotisations: '/api/cotisations',
      cotisationsMensuelles: '/api/cotisations-mensuelles'
    }
  });
});

// Gestion des erreurs 404
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Route non trouvée' });
});

// Gestion des erreurs globales
app.use((error, req, res, next) => {
  console.error('Erreur serveur:', error);
  res.status(500).json({ error: 'Erreur interne du serveur' });
});

// Démarrage du serveur
const startServer = () => {
  try {
    initializeDataFiles();
    
    app.listen(PORT, () => {
      console.log(`🚀 Serveur démarré sur le port ${PORT}`);
      console.log(`📊 API disponible sur http://localhost:${PORT}`);
      console.log(`🏥 Health check: http://localhost:${PORT}/api/health`);
      console.log(`👥 Adhérents: http://localhost:${PORT}/api/adherents`);
    });
  } catch (error) {
    console.error('Erreur démarrage serveur:', error);
    process.exit(1);
  }
};

startServer();
