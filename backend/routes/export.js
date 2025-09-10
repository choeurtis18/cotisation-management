const express = require('express');
const router = express.Router();
const fileManager = require('../utils/fileManager');

// Export CSV pour un adhérent
router.get('/adherent/:id/:annee', async (req, res) => {
  try {
    const { id, annee } = req.params;
    
    // Charger les données
    const adherentsData = fileManager.readData('adherents');
    const cotisationsData = fileManager.readData('cotisations');
    const cotisationsMensuellesData = fileManager.readData('cotisations-mensuelles');
    
    const adherent = adherentsData.adherents.find(a => a.id === id);
    if (!adherent) {
      return res.status(404).json({ error: 'Adhérent non trouvé' });
    }
    
    // Filtrer les cotisations de l'adhérent pour l'année
    const cotisationsAdherent = cotisationsMensuellesData.cotisationsMensuelles.filter(
      cm => cm.adherentId === id && cm.annee === parseInt(annee)
    );
    
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
        const cotisationInfo = cotisationsData.cotisations.find(c => c.id === cotisation.cotisationId);
        const cotisationNom = cotisationInfo ? cotisationInfo.nom : 'Cotisation inconnue';
        
        csvContent += `"${cotisationNom}",${cotisation.moyenneCotisation},${cotisation.totalAttendu},${cotisation.totalVersee},${cotisation.retard},${cotisation.avance}\n`;
      });
      
      // Détail mensuel
      csvContent += '\n\nDétail Mensuel\n';
      csvContent += 'Cotisation,Janvier,Février,Mars,Avril,Mai,Juin,Juillet,Août,Septembre,Octobre,Novembre,Décembre\n';
      
      cotisationsAdherent.forEach((cotisation) => {
        const cotisationInfo = cotisationsData.cotisations.find(c => c.id === cotisation.cotisationId);
        const cotisationNom = cotisationInfo ? cotisationInfo.nom : 'Cotisation inconnue';
        
        csvContent += `"${cotisationNom}",${cotisation.mois.janvier},${cotisation.mois.fevrier},${cotisation.mois.mars},${cotisation.mois.avril},${cotisation.mois.mai},${cotisation.mois.juin},${cotisation.mois.juillet},${cotisation.mois.aout},${cotisation.mois.septembre},${cotisation.mois.octobre},${cotisation.mois.novembre},${cotisation.mois.decembre}\n`;
      });
      
      // Récapitulatif total
      const totalAttendu = cotisationsAdherent.reduce((sum, c) => sum + c.totalAttendu, 0);
      const totalVerse = cotisationsAdherent.reduce((sum, c) => sum + c.totalVersee, 0);
      const totalRetard = cotisationsAdherent.reduce((sum, c) => sum + c.retard, 0);
      const totalAvance = cotisationsAdherent.reduce((sum, c) => sum + c.avance, 0);
      
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
    
    // Charger les données
    const adherentsData = fileManager.readData('adherents');
    const cotisationsData = fileManager.readData('cotisations');
    const cotisationsMensuellesData = fileManager.readData('cotisations-mensuelles');
    
    const cotisation = cotisationsData.cotisations.find(c => c.id === id);
    if (!cotisation) {
      return res.status(404).json({ error: 'Cotisation non trouvée' });
    }
    
    // Filtrer les adhérents de cette cotisation pour l'année
    const adherentsCotisation = cotisationsMensuellesData.cotisationsMensuelles.filter(
      cm => cm.cotisationId === id && cm.annee === parseInt(annee)
    );
    
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
      csvContent += 'Adhérent,Moyenne de cotisation,Total attendu,Total versée,Retard,Avance,Janvier,Février,Mars,Avril,Mai,Juin,Juillet,Août,Septembre,Octobre,Novembre,Décembre\n';
      
      // Données des adhérents avec toutes les colonnes
      adherentsCotisation.forEach((cotisationMensuelle) => {
        const adherentInfo = adherentsData.adherents.find(a => a.id === cotisationMensuelle.adherentId);
        const adherentNom = adherentInfo ? `${adherentInfo.prenom} ${adherentInfo.nom}` : 'Adhérent inconnu';
        
        csvContent += `"${adherentNom}",${cotisationMensuelle.moyenneCotisation},${cotisationMensuelle.totalAttendu},${cotisationMensuelle.totalVersee},${cotisationMensuelle.retard},${cotisationMensuelle.avance},${cotisationMensuelle.mois.janvier},${cotisationMensuelle.mois.fevrier},${cotisationMensuelle.mois.mars},${cotisationMensuelle.mois.avril},${cotisationMensuelle.mois.mai},${cotisationMensuelle.mois.juin},${cotisationMensuelle.mois.juillet},${cotisationMensuelle.mois.aout},${cotisationMensuelle.mois.septembre},${cotisationMensuelle.mois.octobre},${cotisationMensuelle.mois.novembre},${cotisationMensuelle.mois.decembre}\n`;
      });
    }
    
    res.send(csvContent);
    
  } catch (error) {
    console.error('Erreur export CSV cotisation:', error);
    res.status(500).json({ error: 'Erreur lors de la génération du CSV' });
  }
});

module.exports = router;
