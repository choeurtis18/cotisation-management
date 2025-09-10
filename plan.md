# Plan de Développement - Dashboard Cotisations

## Architecture Technique

### Stack Technologique
- **Backend:** NodeJS + Express
- **Frontend:** React + TailwindCSS
- **Stockage:** Fichiers JSON locaux
- **Export:** PDFKit pour génération PDF

### Structure du Projet
```
cotisation-management/
├── backend/
│   ├── package.json
│   ├── server.js
│   ├── data/
│   │   ├── adherents.json
│   │   ├── cotisations.json
│   │   └── cotisations-mensuelles.json
│   ├── routes/
│   │   ├── adherents.js
│   │   ├── cotisations.js
│   │   └── cotisations-mensuelles.js
│   ├── controllers/
│   │   ├── adherentsController.js
│   │   ├── cotisationsController.js
│   │   └── cotisationsMensuellesController.js
│   └── utils/
│       ├── fileManager.js
│       └── calculations.js
├── frontend/
│   ├── package.json
│   ├── public/
│   │   └── index.html
│   ├── src/
│   │   ├── App.js
│   │   ├── index.js
│   │   ├── components/
│   │   │   ├── Layout/
│   │   │   │   ├── Sidebar.js
│   │   │   │   └── Header.js
│   │   │   ├── Common/
│   │   │   │   ├── Modal.js
│   │   │   │   ├── Table.js
│   │   │   │   └── Button.js
│   │   │   └── Forms/
│   │   │       ├── AdherentForm.js
│   │   │       └── CotisationForm.js
│   │   ├── pages/
│   │   │   ├── Adherents/
│   │   │   │   ├── AdherentsList.js
│   │   │   │   └── AdherentDetail.js
│   │   │   ├── Cotisations/
│   │   │   │   ├── CotisationsList.js
│   │   │   │   └── CotisationDetail.js
│   │   │   └── CotisationsMensuelles/
│   │   │       └── CotisationsMensuelles.js
│   │   ├── services/
│   │   │   └── api.js
│   │   └── styles/
│   │       └── index.css
└── README.md
```

---

## Étapes de Développement

### **Étape 1 : Setup Initial & Backend de Base**
**Objectif :** Créer la structure du projet et un backend fonctionnel minimal

**Tâches :**
- Initialiser l'arborescence du projet
- Configurer package.json backend (Express, CORS, etc.)
- Créer server.js avec routes de base
- Créer les fichiers JSON initiaux avec données d'exemple
- Implémenter fileManager.js pour lecture/écriture JSON

**Validation :** 
- `npm start` backend démarre sans erreur
- `GET /api/adherents` retourne la liste des adhérents
- Les fichiers JSON sont correctement lus

---

### **Étape 2 : API Adhérents Complète**
**Objectif :** CRUD complet pour les adhérents

**Tâches :**
- Implémenter tous les endpoints adhérents
- Ajouter validation des données
- Implémenter calculations.js pour les calculs métier
- Tester avec des données du tableau fourni

**Validation :**
- Tous les endpoints adhérents fonctionnent (GET, POST, PUT, DELETE)
- Les calculs (retard, avance, totaux) sont corrects
- Validation des erreurs (adhérent inexistant, données invalides)

---

### **Étape 3 : Frontend React de Base**
**Objectif :** Interface utilisateur fonctionnelle pour les adhérents

**Tâches :**
- Initialiser React avec routing
- Configurer TailwindCSS
- Créer Layout (Sidebar + Header)
- Implémenter AdherentsList avec tableau
- Créer service API pour communication backend

**Validation :**
- Interface s'affiche correctement avec TailwindCSS
- Menu latéral fonctionne
- Liste des adhérents s'affiche depuis l'API
- Navigation entre pages fonctionne

---

### **Étape 4 : CRUD Adhérents Frontend**
**Objectif :** Gestion complète des adhérents côté interface

**Tâches :**
- Formulaires d'ajout/modification adhérent avec TailwindCSS
- Modales de confirmation suppression
- Gestion des erreurs et feedback utilisateur
- Validation côté client

**Validation :**
- Ajout d'adhérent fonctionne et persiste
- Modification d'adhérent fonctionne
- Suppression avec confirmation fonctionne
- Messages d'erreur s'affichent correctement

---

### **Étape 5 : API Cotisations & Cotisations Mensuelles**
**Objectif :** Backend complet pour cotisations

**Tâches :**
- Implémenter endpoints cotisations
- Implémenter endpoints cotisations mensuelles
- Ajouter filtrage par année, mois
- Logique de liaison adhérent-cotisation

**Validation :**
- CRUD cotisations fonctionne
- CRUD cotisations mensuelles fonctionne
- Filtres par date fonctionnent
- Relations entre entités sont cohérentes

---

### **Étape 6 : Pages Détail Adhérent**
**Objectif :** Vue détaillée d'un adhérent avec ses cotisations

**Tâches :**
- Page AdherentDetail avec tableau mensuel stylé TailwindCSS
- Filtrage par année (dropdown)
- Modification des montants mensuels
- Calculs automatiques en temps réel

**Validation :**
- Page détail s'affiche avec données correctes
- Filtrage par année fonctionne
- Modifications se sauvegardent
- Calculs se mettent à jour automatiquement

---

### **Étape 7 : Pages Cotisations Frontend**
**Objectif :** Interface complète pour gestion des cotisations

**Tâches :**
- CotisationsList avec CRUD et design TailwindCSS
- CotisationDetail avec gestion des adhérents
- Ajout/suppression d'adhérents à une cotisation

**Validation :**
- Gestion des cotisations fonctionne
- Association adhérent-cotisation fonctionne
- Vue détaillée cotisation affiche les bons adhérents

---

### **Étape 8 : Page Cotisations Mensuelles**
**Objectif :** Vue globale par mois/année

**Tâches :**
- Interface avec sélecteurs mois/année stylés TailwindCSS
- Tableau récapitulatif des cotisations du mois
- Modification rapide des montants

**Validation :**
- Sélection mois/année fonctionne
- Données du mois s'affichent correctement
- Modifications rapides fonctionnent

---

### **Étape 9 : Export PDF**
**Objectif :** Génération de documents

**Tâches :**
- Installer bibliothèque PDF (PDFKit)
- Créer templates de documents
- Endpoints d'export
- Boutons de téléchargement avec icônes TailwindCSS

**Validation :**
- Export adhérent génère un PDF correct
- Export cotisation génère un PDF correct
- Téléchargement fonctionne depuis l'interface

---

### **Étape 10 : Finitions & Optimisations**
**Objectif :** Polish final et optimisations

**Tâches :**
- Améliorer le design/UX avec TailwindCSS
- Ajouter loading states et animations
- Optimiser les performances
- Tests finaux avec données réelles
- Documentation README

**Validation :**
- Interface fluide et intuitive
- Pas de bugs avec données volumineuses
- Documentation complète

---

## Endpoints API

### Adhérents
```
GET    /api/adherents              - Liste tous les adhérents
POST   /api/adherents              - Crée un adhérent
GET    /api/adherents/:id          - Récupère un adhérent
PUT    /api/adherents/:id          - Modifie un adhérent
DELETE /api/adherents/:id          - Supprime un adhérent
GET    /api/adherents/:id/cotisations/:annee - Cotisations d'un adhérent par année
```

### Cotisations
```
GET    /api/cotisations            - Liste toutes les cotisations
POST   /api/cotisations            - Crée une cotisation
GET    /api/cotisations/:id        - Récupère une cotisation
PUT    /api/cotisations/:id        - Modifie une cotisation
DELETE /api/cotisations/:id        - Supprime une cotisation
GET    /api/cotisations/:id/mensuelles/:annee - Cotisations mensuelles par année
```

### Cotisations Mensuelles
```
GET    /api/cotisations-mensuelles - Liste avec filtres (mois, année, adhérent, cotisation)
POST   /api/cotisations-mensuelles - Crée une cotisation mensuelle
PUT    /api/cotisations-mensuelles/:id - Modifie une cotisation mensuelle
DELETE /api/cotisations-mensuelles/:id - Supprime une cotisation mensuelle
```

### Export
```
GET    /api/export/adherent/:id/:annee - Export PDF adhérent
GET    /api/export/cotisation/:id/:annee - Export PDF cotisation
```

---

## Structure des Données JSON

### adherents.json
```json
{
  "adherents": [
    {
      "id": "uuid",
      "nom": "string",
      "prenom": "string",
      "dateCreation": "ISO date",
      "actif": "boolean"
    }
  ]
}
```

### cotisations.json
```json
{
  "cotisations": [
    {
      "id": "uuid",
      "nom": "string",
      "description": "string",
      "dateCreation": "ISO date",
      "actif": "boolean"
    }
  ]
}
```

### cotisations-mensuelles.json
```json
{
  "cotisationsMensuelles": [
    {
      "id": "uuid",
      "adherentId": "uuid",
      "cotisationId": "uuid",
      "annee": "number",
      "moyenneCotisation": "number",
      "totalAttendu": "number",
      "totalVersee": "number",
      "retard": "number",
      "avance": "number",
      "mois": {
        "janvier": "number",
        "fevrier": "number",
        "mars": "number",
        "avril": "number",
        "mai": "number",
        "juin": "number",
        "juillet": "number",
        "aout": "number",
        "septembre": "number",
        "octobre": "number",
        "novembre": "number",
        "decembre": "number"
      }
    }
  ]
}
```




