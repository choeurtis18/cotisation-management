const express = require('express');
const router = express.Router();
const adherentsController = require('../controllers/adherentsController');

// Routes pour les adhérents
router.get('/', adherentsController.getAllAdherents);
router.get('/:id', adherentsController.getAdherentById);
router.post('/', adherentsController.createAdherent);
router.put('/:id', adherentsController.updateAdherent);
router.delete('/:id', adherentsController.deleteAdherent);

module.exports = router;
