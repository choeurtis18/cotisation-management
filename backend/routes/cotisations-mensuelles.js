const express = require('express');
const router = express.Router();
const cotisationsMensuellesController = require('../controllers/cotisationsMensuellesController');

// Routes pour les cotisations mensuelles
router.get('/', cotisationsMensuellesController.getAllCotisationsMensuelles);
router.get('/:id', cotisationsMensuellesController.getCotisationMensuelleById);
router.post('/', cotisationsMensuellesController.createCotisationMensuelle);
router.put('/:id', cotisationsMensuellesController.updateCotisationMensuelle);
router.delete('/:id', cotisationsMensuellesController.deleteCotisationMensuelle);

module.exports = router;
