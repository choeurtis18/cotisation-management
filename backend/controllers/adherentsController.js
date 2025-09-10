const fileManager = require('../utils/fileManager');
const { v4: uuidv4 } = require('uuid');

class AdherentsController {
  
  // GET /api/adherents
  async getAllAdherents(req, res) {
    try {
      const data = fileManager.readJSON('adherents.json');
      if (!data) {
        return res.status(500).json({ error: 'Erreur lecture des adhérents' });
      }
      res.json(data.adherents);
    } catch (error) {
      res.status(500).json({ error: 'Erreur serveur' });
    }
  }

  // GET /api/adherents/:id
  async getAdherentById(req, res) {
    try {
      const { id } = req.params;
      const data = fileManager.readJSON('adherents.json');
      
      if (!data) {
        return res.status(500).json({ error: 'Erreur lecture des adhérents' });
      }

      const adherent = data.adherents.find(a => a.id === id);
      if (!adherent) {
        return res.status(404).json({ error: 'Adhérent non trouvé' });
      }

      res.json(adherent);
    } catch (error) {
      res.status(500).json({ error: 'Erreur serveur' });
    }
  }

  // POST /api/adherents
  async createAdherent(req, res) {
    try {
      const { nom, prenom } = req.body;

      if (!nom || !prenom) {
        return res.status(400).json({ error: 'Nom et prénom requis' });
      }

      const data = fileManager.readJSON('adherents.json') || { adherents: [] };
      
      const newAdherent = {
        id: uuidv4(),
        nom: nom.trim(),
        prenom: prenom.trim(),
        dateCreation: new Date().toISOString(),
        actif: true
      };

      data.adherents.push(newAdherent);
      
      if (!fileManager.writeJSON('adherents.json', data)) {
        return res.status(500).json({ error: 'Erreur sauvegarde' });
      }

      res.status(201).json(newAdherent);
    } catch (error) {
      res.status(500).json({ error: 'Erreur serveur' });
    }
  }

  // PUT /api/adherents/:id
  async updateAdherent(req, res) {
    try {
      const { id } = req.params;
      const { nom, prenom, actif } = req.body;

      const data = fileManager.readJSON('adherents.json');
      if (!data) {
        return res.status(500).json({ error: 'Erreur lecture des adhérents' });
      }

      const adherentIndex = data.adherents.findIndex(a => a.id === id);
      if (adherentIndex === -1) {
        return res.status(404).json({ error: 'Adhérent non trouvé' });
      }

      // Mise à jour des champs fournis
      if (nom !== undefined) data.adherents[adherentIndex].nom = nom.trim();
      if (prenom !== undefined) data.adherents[adherentIndex].prenom = prenom.trim();
      if (actif !== undefined) data.adherents[adherentIndex].actif = actif;

      if (!fileManager.writeJSON('adherents.json', data)) {
        return res.status(500).json({ error: 'Erreur sauvegarde' });
      }

      res.json(data.adherents[adherentIndex]);
    } catch (error) {
      res.status(500).json({ error: 'Erreur serveur' });
    }
  }

  // DELETE /api/adherents/:id
  async deleteAdherent(req, res) {
    try {
      const { id } = req.params;

      const data = fileManager.readJSON('adherents.json');
      if (!data) {
        return res.status(500).json({ error: 'Erreur lecture des adhérents' });
      }

      const adherentIndex = data.adherents.findIndex(a => a.id === id);
      if (adherentIndex === -1) {
        return res.status(404).json({ error: 'Adhérent non trouvé' });
      }

      // Supprimer l'adhérent
      data.adherents.splice(adherentIndex, 1);

      if (!fileManager.writeJSON('adherents.json', data)) {
        return res.status(500).json({ error: 'Erreur sauvegarde' });
      }

      res.json({ message: 'Adhérent supprimé avec succès' });
    } catch (error) {
      res.status(500).json({ error: 'Erreur serveur' });
    }
  }
}

module.exports = new AdherentsController();
