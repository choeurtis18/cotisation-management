const { query } = require('../utils/database');

class AdherentsController {
  
  // GET /api/adherents
  async getAllAdherents(req, res) {
    try {
      const result = await query('SELECT * FROM adherents ORDER BY nom, prenom');
      // Correction du format de date pour le frontend
      const adherents = result.rows.map(a => ({
        ...a,
        date_creation: a.date_creation ? new Date(a.date_creation).toISOString() : null,
      }));
      res.json(adherents);
    } catch (error) {
      console.error('Erreur getAllAdherents:', error);
      res.status(500).json({ error: 'Erreur serveur' });
    }
  }

  // GET /api/adherents/:id
  async getAdherentById(req, res) {
    try {
      const { id } = req.params;
      const result = await query('SELECT * FROM adherents WHERE id = $1', [id]);
      
      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Adhérent non trouvé' });
      }

      const adherent = {
        ...result.rows[0],
        date_creation: result.rows[0].date_creation ? new Date(result.rows[0].date_creation).toISOString() : null,
      };

      res.json(adherent);
    } catch (error) {
      console.error('Erreur getAdherentById:', error);
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

      const result = await query(
        'INSERT INTO adherents (nom, prenom, date_creation) VALUES ($1, $2, CURRENT_TIMESTAMP) RETURNING *',
        [nom.trim(), prenom.trim()]
      );

      const adherent = {
        ...result.rows[0],
        date_creation: result.rows[0].date_creation ? new Date(result.rows[0].date_creation).toISOString() : null,
      };

      res.status(201).json(adherent);
    } catch (error) {
      console.error('Erreur createAdherent:', error);
      res.status(500).json({ error: 'Erreur serveur' });
    }
  }

  // PUT /api/adherents/:id
  async updateAdherent(req, res) {
    try {
      const { id } = req.params;
      const { nom, prenom } = req.body;

      // Construire la requête de mise à jour dynamiquement
      const updates = [];
      const values = [];
      let paramIndex = 1;

      if (nom !== undefined) {
        updates.push(`nom = $${paramIndex}`);
        values.push(nom.trim());
        paramIndex++;
      }
      if (prenom !== undefined) {
        updates.push(`prenom = $${paramIndex}`);
        values.push(prenom.trim());
        paramIndex++;
      }

      if (updates.length === 0) {
        return res.status(400).json({ error: 'Aucune donnée à mettre à jour' });
      }

      values.push(id);
      const updateQuery = `UPDATE adherents SET ${updates.join(', ')}, updated_at = CURRENT_TIMESTAMP WHERE id = $${paramIndex} RETURNING *`;
      
      const result = await query(updateQuery, values);
      
      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Adhérent non trouvé' });
      }

      const adherent = {
        ...result.rows[0],
        date_creation: result.rows[0].date_creation ? new Date(result.rows[0].date_creation).toISOString() : null,
      };

      res.json(adherent);
    } catch (error) {
      console.error('Erreur updateAdherent:', error);
      res.status(500).json({ error: 'Erreur serveur' });
    }
  }

  // DELETE /api/adherents/:id
  async deleteAdherent(req, res) {
    try {
      const { id } = req.params;

      const result = await query('DELETE FROM adherents WHERE id = $1 RETURNING id', [id]);
      
      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Adhérent non trouvé' });
      }

      res.json({ message: 'Adhérent supprimé avec succès' });
    } catch (error) {
      console.error('Erreur deleteAdherent:', error);
      res.status(500).json({ error: 'Erreur serveur' });
    }
  }
}

module.exports = new AdherentsController();
