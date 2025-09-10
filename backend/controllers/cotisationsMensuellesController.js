const { query } = require('../utils/database');
const calculations = require('../utils/calculations');

class CotisationsMensuellesController {
  
  // GET /api/cotisations-mensuelles
  async getAllCotisationsMensuelles(req, res) {
    try {
      const { mois, annee, adherentId, cotisationId } = req.query;
      
      let sqlQuery = `
        SELECT cm.*, a.nom as adherent_nom, a.prenom as adherent_prenom, c.nom as cotisation_nom
        FROM cotisations_mensuelles cm
        JOIN adherents a ON cm.adherent_id = a.id
        JOIN cotisations c ON cm.cotisation_id = c.id
        WHERE 1=1
      `;
      const params = [];
      let paramIndex = 1;

      // Filtrage par paramètres
      if (annee) {
        sqlQuery += ` AND cm.annee = $${paramIndex}`;
        params.push(parseInt(annee));
        paramIndex++;
      }
      if (adherentId) {
        sqlQuery += ` AND cm.adherent_id = $${paramIndex}`;
        params.push(adherentId);
        paramIndex++;
      }
      if (cotisationId) {
        sqlQuery += ` AND cm.cotisation_id = $${paramIndex}`;
        params.push(cotisationId);
        paramIndex++;
      }
      if (mois) {
        // Filtrer par mois spécifique (cotisations qui ont un montant > 0 pour ce mois)
        sqlQuery += ` AND (cm.mois->>'${mois.toLowerCase()}')::numeric > 0`;
      }

      sqlQuery += ' ORDER BY cm.annee DESC, a.nom, a.prenom';

      const result = await query(sqlQuery, params);
      res.json(result.rows);
    } catch (error) {
      console.error('Erreur getAllCotisationsMensuelles:', error);
      res.status(500).json({ error: 'Erreur serveur' });
    }
  }

  // GET /api/cotisations-mensuelles/:id
  async getCotisationMensuelleById(req, res) {
    try {
      const { id } = req.params;
      const result = await query(`
        SELECT cm.*, a.nom as adherent_nom, a.prenom as adherent_prenom, c.nom as cotisation_nom
        FROM cotisations_mensuelles cm
        JOIN adherents a ON cm.adherent_id = a.id
        JOIN cotisations c ON cm.cotisation_id = c.id
        WHERE cm.id = $1
      `, [id]);
      
      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Cotisation mensuelle non trouvée' });
      }

      res.json(result.rows[0]);
    } catch (error) {
      console.error('Erreur getCotisationMensuelleById:', error);
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
      const adherentCheck = await query('SELECT id FROM adherents WHERE id = $1', [adherentId]);
      if (adherentCheck.rows.length === 0) {
        return res.status(400).json({ error: 'Adhérent non trouvé' });
      }

      // Vérifier que la cotisation existe
      const cotisationCheck = await query('SELECT id FROM cotisations WHERE id = $1', [cotisationId]);
      if (cotisationCheck.rows.length === 0) {
        return res.status(400).json({ error: 'Cotisation non trouvée' });
      }

      // Préparer l'objet mois
      const moisData = {
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
      };

      const result = await query(`
        INSERT INTO cotisations_mensuelles (adherent_id, cotisation_id, annee, moyenne_cotisation, mois)
        VALUES ($1, $2, $3, $4, $5)
        RETURNING *
      `, [adherentId, cotisationId, parseInt(annee), parseFloat(moyenneCotisation), JSON.stringify(moisData)]);

      res.status(201).json(result.rows[0]);
    } catch (error) {
      console.error('Erreur createCotisationMensuelle:', error);
      if (error.code === '23505') { // Violation de contrainte unique
        return res.status(400).json({ error: 'Une cotisation mensuelle existe déjà pour cet adhérent/cotisation/année' });
      }
      res.status(500).json({ error: 'Erreur serveur' });
    }
  }

  // PUT /api/cotisations-mensuelles/:id
  async updateCotisationMensuelle(req, res) {
    try {
      const { id } = req.params;
      const { moyenneCotisation, mois } = req.body;

      // Construire la requête de mise à jour dynamiquement
      const updates = [];
      const values = [];
      let paramIndex = 1;

      if (moyenneCotisation !== undefined) {
        updates.push(`moyenne_cotisation = $${paramIndex}`);
        values.push(parseFloat(moyenneCotisation));
        paramIndex++;
      }
      
      if (mois) {
        // Récupérer les données actuelles pour merger avec les nouvelles valeurs
        const currentData = await query('SELECT mois FROM cotisations_mensuelles WHERE id = $1', [id]);
        if (currentData.rows.length === 0) {
          return res.status(404).json({ error: 'Cotisation mensuelle non trouvée' });
        }
        
        const currentMois = currentData.rows[0].mois;
        const updatedMois = { ...currentMois };
        
        // Mettre à jour seulement les mois fournis
        Object.keys(mois).forEach(month => {
          if (updatedMois.hasOwnProperty(month)) {
            updatedMois[month] = parseFloat(mois[month] || 0);
          }
        });
        
        updates.push(`mois = $${paramIndex}`);
        values.push(JSON.stringify(updatedMois));
        paramIndex++;
      }

      if (updates.length === 0) {
        return res.status(400).json({ error: 'Aucune donnée à mettre à jour' });
      }

      values.push(id);
      const updateQuery = `UPDATE cotisations_mensuelles SET ${updates.join(', ')}, updated_at = CURRENT_TIMESTAMP WHERE id = $${paramIndex} RETURNING *`;
      
      const result = await query(updateQuery, values);
      
      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Cotisation mensuelle non trouvée' });
      }

      res.json(result.rows[0]);
    } catch (error) {
      console.error('Erreur updateCotisationMensuelle:', error);
      res.status(500).json({ error: 'Erreur serveur' });
    }
  }

  // DELETE /api/cotisations-mensuelles/:id
  async deleteCotisationMensuelle(req, res) {
    try {
      const { id } = req.params;

      const result = await query('DELETE FROM cotisations_mensuelles WHERE id = $1 RETURNING id', [id]);
      
      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Cotisation mensuelle non trouvée' });
      }

      res.json({ message: 'Cotisation mensuelle supprimée avec succès' });
    } catch (error) {
      console.error('Erreur deleteCotisationMensuelle:', error);
      res.status(500).json({ error: 'Erreur serveur' });
    }
  }

  // GET /api/adherents/:id/cotisations/:annee
  async getCotisationsAdherentByYear(req, res) {
    try {
      const { id: adherentId, annee } = req.params;

      const result = await query(`
        SELECT cm.*, c.nom as cotisation_nom, c.description as cotisation_description
        FROM cotisations_mensuelles cm
        JOIN cotisations c ON cm.cotisation_id = c.id
        WHERE cm.adherent_id = $1 AND cm.annee = $2
        ORDER BY c.nom
      `, [adherentId, parseInt(annee)]);

      res.json(result.rows);
    } catch (error) {
      console.error('Erreur getCotisationsAdherentByYear:', error);
      res.status(500).json({ error: 'Erreur serveur' });
    }
  }

  // GET /api/cotisations/:id/mensuelles/:annee
  async getCotisationsMensuellesByCotisationAndYear(req, res) {
    try {
      const { id: cotisationId, annee } = req.params;

      const result = await query(`
        SELECT cm.*, a.nom as adherent_nom, a.prenom as adherent_prenom
        FROM cotisations_mensuelles cm
        JOIN adherents a ON cm.adherent_id = a.id
        WHERE cm.cotisation_id = $1 AND cm.annee = $2
        ORDER BY a.nom, a.prenom
      `, [cotisationId, parseInt(annee)]);

      res.json(result.rows);
    } catch (error) {
      console.error('Erreur getCotisationsMensuellesByCotisationAndYear:', error);
      res.status(500).json({ error: 'Erreur serveur' });
    }
  }
}

module.exports = new CotisationsMensuellesController();
