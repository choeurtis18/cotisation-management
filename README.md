# Dashboard Cotisations Management

Dashboard web pour la gestion des cotisations d'adhérents avec NodeJS + React + TailwindCSS.

## Structure du Projet

```
cotisation-management/
├── backend/           # API NodeJS + Express
├── frontend/          # Interface React + TailwindCSS
├── plan.md           # Plan de développement détaillé
└── README.md         # Ce fichier
```

## Installation et Démarrage

### Backend

```bash
cd backend
npm install
npm start
```

Le serveur démarre sur `http://localhost:3001`

### Endpoints Disponibles

- `GET /api/health` - Health check
- `GET /api/adherents` - Liste des adhérents
- `POST /api/adherents` - Créer un adhérent
- `GET /api/adherents/:id` - Récupérer un adhérent
- `PUT /api/adherents/:id` - Modifier un adhérent
- `DELETE /api/adherents/:id` - Supprimer un adhérent

### Frontend (À venir)

```bash
cd frontend
npm install
npm start
```

## Fonctionnalités

- ✅ Gestion des adhérents (CRUD)
- ⏳ Gestion des cotisations
- ⏳ Gestion des cotisations mensuelles
- ⏳ Interface React avec TailwindCSS
- ⏳ Export PDF
- ⏳ Calculs automatiques

## Données

Les données sont stockées dans des fichiers JSON locaux dans `backend/data/`:
- `adherents.json` - Liste des adhérents
- `cotisations.json` - Liste des cotisations
- `cotisations-mensuelles.json` - Données mensuelles des cotisations

## Développement

Voir `plan.md` pour le plan de développement détaillé en 10 étapes.

**Étape actuelle :** Étape 1 - Setup Initial & Backend de Base ✅
