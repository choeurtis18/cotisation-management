const { query } = require('../utils/database');

class CotisationsController {
  
  // GET /api/cotisations
  async getAllCotisations(req, res) {
    try {
      const result = await query('SELECT * FROM cotisations ORDER BY nom');
      res.json(result.rows);
    } catch (error) {
      console.error('Erreur getAllCotisations:', error);
      res.status(500).json({ error: 'Erreur serveur' });
    }
  }

  // GET /api/cotisations/:id
  async getCotisationById(req, res) {
    try {
      const { id } = req.params;
      const result = await query('SELECT * FROM cotisations WHERE id = $1', [id]);
      
      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Cotisation non trouvée' });
      }

      res.json(result.rows[0]);
    } catch (error) {
      console.error('Erreur getCotisationById:', error);
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

      const result = await query(
        'INSERT INTO cotisations (nom, description) VALUES ($1, $2) RETURNING *',
        [nom.trim(), description ? description.trim() : '']
      );

      res.status(201).json(result.rows[0]);
    } catch (error) {
      console.error('Erreur createCotisation:', error);
      if (error.code === '23505') { // Violation de contrainte unique
        return res.status(400).json({ error: 'Une cotisation avec ce nom existe déjà' });
      }
      res.status(500).json({ error: 'Erreur serveur' });
    }
  }

  // PUT /api/cotisations/:id
  async updateCotisation(req, res) {
    try {
      const { id } = req.params;
      const { nom, description } = req.body;

      // Construire la requête de mise à jour dynamiquement
      const updates = [];
      const values = [];
      let paramIndex = 1;

      if (nom !== undefined) {
        updates.push(`nom = $${paramIndex}`);
        values.push(nom.trim());
        paramIndex++;
      }
      if (description !== undefined) {
        updates.push(`description = $${paramIndex}`);
        values.push(description.trim());
        paramIndex++;
      }

      if (updates.length === 0) {
        return res.status(400).json({ error: 'Aucune donnée à mettre à jour' });
      }

      values.push(id);
      const updateQuery = `UPDATE cotisations SET ${updates.join(', ')}, updated_at = CURRENT_TIMESTAMP WHERE id = $${paramIndex} RETURNING *`;
      
      const result = await query(updateQuery, values);
      
      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Cotisation non trouvée' });
      }

      res.json(result.rows[0]);
    } catch (error) {
      console.error('Erreur updateCotisation:', error);
      if (error.code === '23505') { // Violation de contrainte unique
        return res.status(400).json({ error: 'Une cotisation avec ce nom existe déjà' });
      }
      res.status(500).json({ error: 'Erreur serveur' });
    }
  }

  // DELETE /api/cotisations/:id
  async deleteCotisation(req, res) {
    try {
      const { id } = req.params;

      const result = await query('DELETE FROM cotisations WHERE id = $1 RETURNING id', [id]);
      
      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Cotisation non trouvée' });
      }

      res.json({ message: 'Cotisation supprimée avec succès' });
    } catch (error) {
      console.error('Erreur deleteCotisation:', error);
      res.status(500).json({ error: 'Erreur serveur' });
    }
  }
}

module.exports = new CotisationsController();
