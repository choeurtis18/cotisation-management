const express = require('express');
const router = express.Router();

// Export CSV pour un adhérent
router.get('/adherent/:id/:annee', async (req, res) => {
  try {
    const { id, annee } = req.params;
    const { query } = require('../utils/database');
    
    // Récupérer l'adhérent
    const adherentResult = await query('SELECT * FROM adherents WHERE id = $1', [id]);
    if (adherentResult.rows.length === 0) {
      return res.status(404).json({ error: 'Adhérent non trouvé' });
    }
    const adherent = adherentResult.rows[0];
    
    // Récupérer les cotisations mensuelles de l'adhérent avec les noms des cotisations
    const cotisationsAdherentResult = await query(`
      SELECT cm.*, c.nom as cotisation_nom
      FROM cotisations_mensuelles cm
      JOIN cotisations c ON cm.cotisation_id = c.id
      WHERE cm.adherent_id = $1 AND cm.annee = $2
      ORDER BY c.nom
    `, [id, parseInt(annee)]);
    
    const cotisationsAdherent = cotisationsAdherentResult.rows;
    
    // Headers pour le téléchargement CSV
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="adherent_${adherent.prenom}_${adherent.nom}_${annee}.csv"`);
    
    // Créer le contenu CSV
    let csvContent = '\uFEFF'; // BOM pour UTF-8
    csvContent += `Récapitulatif des Cotisations - ${adherent.prenom} ${adherent.nom} - Année ${annee}\n\n`;
    
    if (cotisationsAdherent.length === 0) {
      csvContent += 'Aucune cotisation trouvée pour cette année.\n';
    } else {
      // En-têtes du tableau principal
      csvContent += 'Cotisation,Moyenne Mensuelle,Total Attendu,Total Versé,Retard,Avance\n';
      
      // Données principales
      cotisationsAdherent.forEach((cotisation) => {
        const moyenneCotisation = parseFloat(cotisation.moyenne_cotisation) || 0;
        const totalAttendu = moyenneCotisation * 12;
        const totalVersee = Object.values(cotisation.mois || {}).reduce((sum, montant) => sum + (parseFloat(montant) || 0), 0);
        const difference = totalVersee - totalAttendu;
        const retard = difference < 0 ? Math.abs(difference) : 0;
        const avance = difference > 0 ? difference : 0;
        
        csvContent += `"${cotisation.cotisation_nom}",${moyenneCotisation},${totalAttendu},${totalVersee},${retard},${avance}\n`;
      });
      
      // Détail mensuel
      csvContent += '\n\nDétail Mensuel\n';
      csvContent += 'Cotisation,Janvier,Février,Mars,Avril,Mai,Juin,Juillet,Août,Septembre,Octobre,Novembre,Décembre\n';
      
      cotisationsAdherent.forEach((cotisation) => {
        csvContent += `"${cotisation.cotisation_nom}",${cotisation.mois.janvier || 0},${cotisation.mois.fevrier || 0},${cotisation.mois.mars || 0},${cotisation.mois.avril || 0},${cotisation.mois.mai || 0},${cotisation.mois.juin || 0},${cotisation.mois.juillet || 0},${cotisation.mois.aout || 0},${cotisation.mois.septembre || 0},${cotisation.mois.octobre || 0},${cotisation.mois.novembre || 0},${cotisation.mois.decembre || 0}\n`;
      });
      
      // Récapitulatif total
      let totalAttendu = 0;
      let totalVerse = 0;
      let totalRetard = 0;
      let totalAvance = 0;
      
      cotisationsAdherent.forEach((cotisation) => {
        const moyenneCotisation = parseFloat(cotisation.moyenne_cotisation) || 0;
        const attendu = moyenneCotisation * 12;
        const verse = Object.values(cotisation.mois || {}).reduce((sum, montant) => sum + (parseFloat(montant) || 0), 0);
        const difference = verse - attendu;
        
        totalAttendu += attendu;
        totalVerse += verse;
        totalRetard += difference < 0 ? Math.abs(difference) : 0;
        totalAvance += difference > 0 ? difference : 0;
      });
      
      csvContent += '\n\nRécapitulatif Total\n';
      csvContent += 'Indicateur,Montant\n';
      csvContent += `Total Attendu,${totalAttendu}\n`;
      csvContent += `Total Versé,${totalVerse}\n`;
      csvContent += `Total Retard,${totalRetard}\n`;
      csvContent += `Total Avance,${totalAvance}\n`;
    }
    
    res.send(csvContent);
    
  } catch (error) {
    console.error('Erreur export CSV adhérent:', error);
    res.status(500).json({ error: 'Erreur lors de la génération du CSV' });
  }
});

// Export CSV pour une cotisation
router.get('/cotisation/:id/:annee', async (req, res) => {
  try {
    const { id, annee } = req.params;
    const { query } = require('../utils/database');
    
    // Récupérer la cotisation
    const cotisationResult = await query('SELECT * FROM cotisations WHERE id = $1', [id]);
    if (cotisationResult.rows.length === 0) {
      return res.status(404).json({ error: 'Cotisation non trouvée' });
    }
    const cotisation = cotisationResult.rows[0];
    
    // Récupérer les cotisations mensuelles avec les noms des adhérents
    const cotisationsMensuellesResult = await query(`
      SELECT cm.*, a.nom as adherent_nom, a.prenom as adherent_prenom
      FROM cotisations_mensuelles cm
      JOIN adherents a ON cm.adherent_id = a.id
      WHERE cm.cotisation_id = $1 AND cm.annee = $2
      ORDER BY a.nom, a.prenom
    `, [id, parseInt(annee)]);
    
    const adherentsCotisation = cotisationsMensuellesResult.rows;
    
    // Headers pour le téléchargement CSV
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="Cotisations_${cotisation.nom.replace(/\s+/g, '_')}_-_Annee_${annee}.csv"`);
    
    // Créer le contenu CSV
    let csvContent = '\uFEFF'; // BOM pour UTF-8
    csvContent += `Cotisations ${cotisation.nom} - Année ${annee}\n\n`;
    
    if (adherentsCotisation.length === 0) {
      csvContent += 'Aucun adhérent trouvé pour cette cotisation cette année.\n';
    } else {
      // En-têtes du tableau avec toutes les colonnes mensuelles
      csvContent += 'Adhérent,Moyenne de cotisation,Total attendu,Total versé,Retard,Avance,Janvier,Février,Mars,Avril,Mai,Juin,Juillet,Août,Septembre,Octobre,Novembre,Décembre\n';
      
      // Données des adhérents avec toutes les colonnes
      adherentsCotisation.forEach((cotisationMensuelle) => {
        const adherentNom = `${cotisationMensuelle.adherent_prenom} ${cotisationMensuelle.adherent_nom}`;
        
        // Calculer les totaux
        const moyenneCotisation = parseFloat(cotisationMensuelle.moyenne_cotisation) || 0;
        const totalAttendu = moyenneCotisation * 12;
        const totalVersee = Object.values(cotisationMensuelle.mois || {}).reduce((sum, montant) => sum + (parseFloat(montant) || 0), 0);
        const difference = totalVersee - totalAttendu;
        const retard = difference < 0 ? Math.abs(difference) : 0;
        const avance = difference > 0 ? difference : 0;
        
        csvContent += `"${adherentNom}",${moyenneCotisation},${totalAttendu},${totalVersee},${retard},${avance},${cotisationMensuelle.mois.janvier || 0},${cotisationMensuelle.mois.fevrier || 0},${cotisationMensuelle.mois.mars || 0},${cotisationMensuelle.mois.avril || 0},${cotisationMensuelle.mois.mai || 0},${cotisationMensuelle.mois.juin || 0},${cotisationMensuelle.mois.juillet || 0},${cotisationMensuelle.mois.aout || 0},${cotisationMensuelle.mois.septembre || 0},${cotisationMensuelle.mois.octobre || 0},${cotisationMensuelle.mois.novembre || 0},${cotisationMensuelle.mois.decembre || 0}\n`;
      });
    }
    
    res.send(csvContent);
    
  } catch (error) {
    console.error('Erreur export CSV cotisation:', error);
    res.status(500).json({ error: 'Erreur lors de la génération du CSV' });
  }
});

module.exports = router;
