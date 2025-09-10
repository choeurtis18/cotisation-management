const fileManager = require('../utils/fileManager');
const calculations = require('../utils/calculations');
const { v4: uuidv4 } = require('uuid');

class CotisationsMensuellesController {
  
  // GET /api/cotisations-mensuelles
  async getAllCotisationsMensuelles(req, res) {
    try {
      const { mois, annee, adherentId, cotisationId } = req.query;
      
      const data = fileManager.readJSON('cotisations-mensuelles.json');
      if (!data) {
        return res.status(500).json({ error: 'Erreur lecture des cotisations mensuelles' });
      }

      let cotisations = data.cotisationsMensuelles;

      // Filtrage par paramètres
      if (annee) {
        cotisations = cotisations.filter(c => c.annee === parseInt(annee));
      }
      if (adherentId) {
        cotisations = cotisations.filter(c => c.adherentId === adherentId);
      }
      if (cotisationId) {
        cotisations = cotisations.filter(c => c.cotisationId === cotisationId);
      }
      if (mois) {
        // Filtrer par mois spécifique (cotisations qui ont un montant > 0 pour ce mois)
        cotisations = cotisations.filter(c => c.mois[mois.toLowerCase()] > 0);
      }

      res.json(cotisations);
    } catch (error) {
      res.status(500).json({ error: 'Erreur serveur' });
    }
  }

  // GET /api/cotisations-mensuelles/:id
  async getCotisationMensuelleById(req, res) {
    try {
      const { id } = req.params;
      const data = fileManager.readJSON('cotisations-mensuelles.json');
      
      if (!data) {
        return res.status(500).json({ error: 'Erreur lecture des cotisations mensuelles' });
      }

      const cotisation = data.cotisationsMensuelles.find(c => c.id === id);
      if (!cotisation) {
        return res.status(404).json({ error: 'Cotisation mensuelle non trouvée' });
      }

      res.json(cotisation);
    } catch (error) {
      res.status(500).json({ error: 'Erreur serveur' });
    }
  }

  // POST /api/cotisations-mensuelles
  async createCotisationMensuelle(req, res) {
    try {
      const { adherentId, cotisationId, annee, moyenneCotisation, mois } = req.body;

      if (!adherentId || !cotisationId || !annee || !moyenneCotisation || !mois) {
        return res.status(400).json({ error: 'Tous les champs requis: adherentId, cotisationId, annee, moyenneCotisation, mois' });
      }

      // Vérifier que l'adhérent existe
      const adherentsData = fileManager.readJSON('adherents.json');
      if (!adherentsData || !adherentsData.adherents.find(a => a.id === adherentId)) {
        return res.status(400).json({ error: 'Adhérent non trouvé' });
      }

      // Vérifier que la cotisation existe
      const cotisationsData = fileManager.readJSON('cotisations.json');
      if (!cotisationsData || !cotisationsData.cotisations.find(c => c.id === cotisationId)) {
        return res.status(400).json({ error: 'Cotisation non trouvée' });
      }

      const data = fileManager.readJSON('cotisations-mensuelles.json') || { cotisationsMensuelles: [] };
      
      // Vérifier qu'il n'existe pas déjà une cotisation mensuelle pour cet adhérent/cotisation/année
      const existingCotisation = data.cotisationsMensuelles.find(c => 
        c.adherentId === adherentId && 
        c.cotisationId === cotisationId && 
        c.annee === parseInt(annee)
      );

      if (existingCotisation) {
        return res.status(400).json({ error: 'Une cotisation mensuelle existe déjà pour cet adhérent/cotisation/année' });
      }

      const newCotisationMensuelle = {
        id: uuidv4(),
        adherentId,
        cotisationId,
        annee: parseInt(annee),
        moyenneCotisation: parseFloat(moyenneCotisation),
        mois: {
          janvier: parseFloat(mois.janvier || 0),
          fevrier: parseFloat(mois.fevrier || 0),
          mars: parseFloat(mois.mars || 0),
          avril: parseFloat(mois.avril || 0),
          mai: parseFloat(mois.mai || 0),
          juin: parseFloat(mois.juin || 0),
          juillet: parseFloat(mois.juillet || 0),
          aout: parseFloat(mois.aout || 0),
          septembre: parseFloat(mois.septembre || 0),
          octobre: parseFloat(mois.octobre || 0),
          novembre: parseFloat(mois.novembre || 0),
          decembre: parseFloat(mois.decembre || 0)
        }
      };

      // Calculer automatiquement les totaux
      const cotisationAvecCalculs = calculations.calculateAllTotals(newCotisationMensuelle);

      // Valider les données
      const validation = calculations.validateCotisationMensuelle(cotisationAvecCalculs);
      if (!validation.isValid) {
        return res.status(400).json({ error: 'Données invalides', details: validation.errors });
      }

      data.cotisationsMensuelles.push(cotisationAvecCalculs);
      
      if (!fileManager.writeJSON('cotisations-mensuelles.json', data)) {
        return res.status(500).json({ error: 'Erreur sauvegarde' });
      }

      res.status(201).json(cotisationAvecCalculs);
    } catch (error) {
      res.status(500).json({ error: 'Erreur serveur' });
    }
  }

  // PUT /api/cotisations-mensuelles/:id
  async updateCotisationMensuelle(req, res) {
    try {
      const { id } = req.params;
      const { moyenneCotisation, mois } = req.body;

      const data = fileManager.readJSON('cotisations-mensuelles.json');
      if (!data) {
        return res.status(500).json({ error: 'Erreur lecture des cotisations mensuelles' });
      }

      const cotisationIndex = data.cotisationsMensuelles.findIndex(c => c.id === id);
      if (cotisationIndex === -1) {
        return res.status(404).json({ error: 'Cotisation mensuelle non trouvée' });
      }

      // Mise à jour des champs fournis
      if (moyenneCotisation !== undefined) {
        data.cotisationsMensuelles[cotisationIndex].moyenneCotisation = parseFloat(moyenneCotisation);
      }
      
      if (mois) {
        Object.keys(mois).forEach(month => {
          if (data.cotisationsMensuelles[cotisationIndex].mois.hasOwnProperty(month)) {
            data.cotisationsMensuelles[cotisationIndex].mois[month] = parseFloat(mois[month] || 0);
          }
        });
      }

      // Recalculer automatiquement les totaux
      data.cotisationsMensuelles[cotisationIndex] = calculations.calculateAllTotals(data.cotisationsMensuelles[cotisationIndex]);

      // Valider les données
      const validation = calculations.validateCotisationMensuelle(data.cotisationsMensuelles[cotisationIndex]);
      if (!validation.isValid) {
        return res.status(400).json({ error: 'Données invalides après modification', details: validation.errors });
      }

      if (!fileManager.writeJSON('cotisations-mensuelles.json', data)) {
        return res.status(500).json({ error: 'Erreur sauvegarde' });
      }

      res.json(data.cotisationsMensuelles[cotisationIndex]);
    } catch (error) {
      res.status(500).json({ error: 'Erreur serveur' });
    }
  }

  // DELETE /api/cotisations-mensuelles/:id
  async deleteCotisationMensuelle(req, res) {
    try {
      const { id } = req.params;

      const data = fileManager.readJSON('cotisations-mensuelles.json');
      if (!data) {
        return res.status(500).json({ error: 'Erreur lecture des cotisations mensuelles' });
      }

      const cotisationIndex = data.cotisationsMensuelles.findIndex(c => c.id === id);
      if (cotisationIndex === -1) {
        return res.status(404).json({ error: 'Cotisation mensuelle non trouvée' });
      }

      // Supprimer la cotisation mensuelle
      data.cotisationsMensuelles.splice(cotisationIndex, 1);

      if (!fileManager.writeJSON('cotisations-mensuelles.json', data)) {
        return res.status(500).json({ error: 'Erreur sauvegarde' });
      }

      res.json({ message: 'Cotisation mensuelle supprimée avec succès' });
    } catch (error) {
      res.status(500).json({ error: 'Erreur serveur' });
    }
  }

  // GET /api/adherents/:id/cotisations/:annee
  async getCotisationsAdherentByYear(req, res) {
    try {
      const { id: adherentId, annee } = req.params;

      const data = fileManager.readJSON('cotisations-mensuelles.json');
      if (!data) {
        return res.status(500).json({ error: 'Erreur lecture des cotisations mensuelles' });
      }

      const cotisations = data.cotisationsMensuelles.filter(c => 
        c.adherentId === adherentId && 
        c.annee === parseInt(annee)
      );

      res.json(cotisations);
    } catch (error) {
      res.status(500).json({ error: 'Erreur serveur' });
    }
  }

  // GET /api/cotisations/:id/mensuelles/:annee
  async getCotisationsMensuellesByCotisationAndYear(req, res) {
    try {
      const { id: cotisationId, annee } = req.params;

      const data = fileManager.readJSON('cotisations-mensuelles.json');
      if (!data) {
        return res.status(500).json({ error: 'Erreur lecture des cotisations mensuelles' });
      }

      const cotisations = data.cotisationsMensuelles.filter(c => 
        c.cotisationId === cotisationId && 
        c.annee === parseInt(annee)
      );

      res.json(cotisations);
    } catch (error) {
      res.status(500).json({ error: 'Erreur serveur' });
    }
  }
}

module.exports = new CotisationsMensuellesController();
