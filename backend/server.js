require('dotenv').config();

const express = require('express');
const cors = require('cors');
const { testConnection } = require('./utils/database');

const app = express();
const PORT = process.env.PORT || 3001;

// ✅ Liste blanche des origines autorisées
const allowedOrigins = [
  process.env.FRONTEND_URL,
  'http://localhost:3000'
];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    } else {
      console.log(`CORS rejeté -> ${origin}`);
      console.log(`Env FRONTEND_URL = ${process.env.FRONTEND_URL}`);
      return callback(new Error(`CORS: origine non autorisée -> ${origin}`));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));


// Import routes
const adherentsRoutes = require('./routes/adherents');
const cotisationsRoutes = require('./routes/cotisations');
const cotisationsMensuellesRoutes = require('./routes/cotisations-mensuelles');
const exportRoutes = require('./routes/export');


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


const initializeDatabase = async () => {
  try {
    console.log('Test de connexion PostgreSQL...');
    const connected = await testConnection();
    if (!connected) {
      console.log('⚠️  PostgreSQL non disponible, utilisation des fichiers JSON');
    }
  } catch (error) {
    console.error('Erreur lors du test de connexion PostgreSQL:', error);
    console.log('⚠️  Fallback vers fichiers JSON');
  }
};

// Démarrage du serveur
const startServer = async () => {
  await initializeDatabase();
  
  const server = app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Serveur démarré sur le port ${PORT}`);
    console.log(`📊 API disponible sur http://localhost:${PORT}`);
    console.log(`🏥 Health check: http://localhost:${PORT}/api/health`);
    console.log(`👥 Adhérents: http://localhost:${PORT}/api/adherents`);
  });

  // Gestion gracieuse de l'arrêt
  process.on('SIGTERM', () => {
    console.log('SIGTERM reçu, arrêt gracieux du serveur...');
    server.close(() => {
      console.log('Serveur fermé');
      process.exit(0);
    });
  });
};

startServer();
