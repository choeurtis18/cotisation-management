const fileManager = require('../utils/fileManager');
const { v4: uuidv4 } = require('uuid');

class CotisationsController {
  
  // GET /api/cotisations
  async getAllCotisations(req, res) {
    try {
      const data = fileManager.readJSON('cotisations.json');
      if (!data) {
        return res.status(500).json({ error: 'Erreur lecture des cotisations' });
      }
      res.json(data.cotisations);
    } catch (error) {
      res.status(500).json({ error: 'Erreur serveur' });
    }
  }

  // GET /api/cotisations/:id
  async getCotisationById(req, res) {
    try {
      const { id } = req.params;
      const data = fileManager.readJSON('cotisations.json');
      
      if (!data) {
        return res.status(500).json({ error: 'Erreur lecture des cotisations' });
      }

      const cotisation = data.cotisations.find(c => c.id === id);
      if (!cotisation) {
        return res.status(404).json({ error: 'Cotisation non trouvée' });
      }

      res.json(cotisation);
    } catch (error) {
      res.status(500).json({ error: 'Erreur serveur' });
    }
  }

  // POST /api/cotisations
  async createCotisation(req, res) {
    try {
      const { nom, description } = req.body;

      if (!nom) {
        return res.status(400).json({ error: 'Nom requis' });
      }

      const data = fileManager.readJSON('cotisations.json') || { cotisations: [] };
      
      const newCotisation = {
        id: uuidv4(),
        nom: nom.trim(),
        description: description ? description.trim() : '',
        dateCreation: new Date().toISOString(),
        actif: true
      };

      data.cotisations.push(newCotisation);
      
      if (!fileManager.writeJSON('cotisations.json', data)) {
        return res.status(500).json({ error: 'Erreur sauvegarde' });
      }

      res.status(201).json(newCotisation);
    } catch (error) {
      res.status(500).json({ error: 'Erreur serveur' });
    }
  }

  // PUT /api/cotisations/:id
  async updateCotisation(req, res) {
    try {
      const { id } = req.params;
      const { nom, description, actif } = req.body;

      const data = fileManager.readJSON('cotisations.json');
      if (!data) {
        return res.status(500).json({ error: 'Erreur lecture des cotisations' });
      }

      const cotisationIndex = data.cotisations.findIndex(c => c.id === id);
      if (cotisationIndex === -1) {
        return res.status(404).json({ error: 'Cotisation non trouvée' });
      }

      // Mise à jour des champs fournis
      if (nom !== undefined) data.cotisations[cotisationIndex].nom = nom.trim();
      if (description !== undefined) data.cotisations[cotisationIndex].description = description.trim();
      if (actif !== undefined) data.cotisations[cotisationIndex].actif = actif;

      if (!fileManager.writeJSON('cotisations.json', data)) {
        return res.status(500).json({ error: 'Erreur sauvegarde' });
      }

      res.json(data.cotisations[cotisationIndex]);
    } catch (error) {
      res.status(500).json({ error: 'Erreur serveur' });
    }
  }

  // DELETE /api/cotisations/:id
  async deleteCotisation(req, res) {
    try {
      const { id } = req.params;

      const data = fileManager.readJSON('cotisations.json');
      if (!data) {
        return res.status(500).json({ error: 'Erreur lecture des cotisations' });
      }

      const cotisationIndex = data.cotisations.findIndex(c => c.id === id);
      if (cotisationIndex === -1) {
        return res.status(404).json({ error: 'Cotisation non trouvée' });
      }

      // Supprimer la cotisation
      data.cotisations.splice(cotisationIndex, 1);

      if (!fileManager.writeJSON('cotisations.json', data)) {
        return res.status(500).json({ error: 'Erreur sauvegarde' });
      }

      res.json({ message: 'Cotisation supprimée avec succès' });
    } catch (error) {
      res.status(500).json({ error: 'Erreur serveur' });
    }
  }
}

module.exports = new CotisationsController();
