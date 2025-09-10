const express = require('express');
const router = express.Router();
const cotisationsController = require('../controllers/cotisationsController');

// Routes pour les cotisations
router.get('/', cotisationsController.getAllCotisations);
router.get('/:id', cotisationsController.getCotisationById);
router.post('/', cotisationsController.createCotisation);
router.put('/:id', cotisationsController.updateCotisation);
router.delete('/:id', cotisationsController.deleteCotisation);

module.exports = router;
