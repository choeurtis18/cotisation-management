class Calculations {
  
  /**
   * Calcule le total attendu basé sur la moyenne de cotisation
   * @param {number} moyenneCotisation 
   * @returns {number}
   */
  calculateTotalAttendu(moyenneCotisation) {
    return moyenneCotisation * 12;
  }

  /**
   * Calcule le total versé en additionnant tous les mois
   * @param {Object} mois - Objet contenant les 12 mois
   * @returns {number}
   */
  calculateTotalVersee(mois) {
    return Object.values(mois).reduce((total, montant) => total + (montant || 0), 0);
  }

  /**
   * Calcule le retard (max(0, totalAttendu - totalVersee))
   * @param {number} totalAttendu 
   * @param {number} totalVersee 
   * @returns {number}
   */
  calculateRetard(totalAttendu, totalVersee) {
    return Math.max(0, totalAttendu - totalVersee);
  }

  /**
   * Calcule l'avance (max(0, totalVersee - totalAttendu))
   * @param {number} totalAttendu 
   * @param {number} totalVersee 
   * @returns {number}
   */
  calculateAvance(totalAttendu, totalVersee) {
    return Math.max(0, totalVersee - totalAttendu);
  }

  /**
   * Calcule tous les totaux et met à jour l'objet cotisation mensuelle
   * @param {Object} cotisationMensuelle 
   * @returns {Object}
   */
  calculateAllTotals(cotisationMensuelle) {
    const totalAttendu = this.calculateTotalAttendu(cotisationMensuelle.moyenneCotisation);
    const totalVersee = this.calculateTotalVersee(cotisationMensuelle.mois);
    const retard = this.calculateRetard(totalAttendu, totalVersee);
    const avance = this.calculateAvance(totalAttendu, totalVersee);

    return {
      ...cotisationMensuelle,
      totalAttendu,
      totalVersee,
      retard,
      avance
    };
  }

  /**
   * Déduit la moyenne de cotisation basée sur le PGCD des montants non nuls
   * @param {Object} mois 
   * @returns {number}
   */
  deduceMoyenneCotisation(mois) {
    const montantsNonNuls = Object.values(mois).filter(montant => montant > 0);
    
    if (montantsNonNuls.length === 0) return 0;
    if (montantsNonNuls.length === 1) return montantsNonNuls[0];

    // Calcul du PGCD de tous les montants non nuls
    return montantsNonNuls.reduce((pgcd, montant) => this.gcd(pgcd, montant));
  }

  /**
   * Calcule le PGCD de deux nombres
   * @param {number} a 
   * @param {number} b 
   * @returns {number}
   */
  gcd(a, b) {
    return b === 0 ? a : this.gcd(b, a % b);
  }

  /**
   * Valide la cohérence des données selon les règles métier
   * @param {Object} cotisationMensuelle 
   * @returns {Object} { isValid: boolean, errors: string[] }
   */
  validateCotisationMensuelle(cotisationMensuelle) {
    const errors = [];
    
    // Vérifier que tous les montants mensuels sont >= 0
    Object.entries(cotisationMensuelle.mois).forEach(([mois, montant]) => {
      if (montant < 0) {
        errors.push(`Le montant pour ${mois} ne peut pas être négatif`);
      }
    });

    // Vérifier l'identité comptable : totalVersee + retard - avance = totalAttendu
    const { totalAttendu, totalVersee, retard, avance } = cotisationMensuelle;
    const identiteComptable = totalVersee + retard - avance;
    
    if (Math.abs(identiteComptable - totalAttendu) > 0.01) {
      errors.push('Identité comptable non respectée : totalVersee + retard - avance ≠ totalAttendu');
    }

    // Vérifier que retard et avance sont mutuellement exclusifs
    if (retard > 0 && avance > 0) {
      errors.push('Retard et avance ne peuvent pas être tous les deux positifs');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }
}

module.exports = new Calculations();
