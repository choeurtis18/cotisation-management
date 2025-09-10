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
- ✅ Gestion des cotisations (CRUD)
- ✅ Gestion des cotisations mensuelles (CRUD)
- ✅ Interface React avec TailwindCSS (responsive, menu burger)
- ✅ Export CSV (remplace l'export PDF)
- ✅ Calculs automatiques (total attendu, versé, avance/retard)
- ✅ Filtrage par année/mois
- ✅ Responsive complet (mobile/tablette/desktop)

L'export PDF a été remplacé par un export CSV universel plus adapté.

## Données

Les données sont stockées dans des fichiers JSON locaux dans `backend/data/`:
- `adherents.json` - Liste des adhérents
- `cotisations.json` - Liste des cotisations
- `cotisations-mensuelles.json` - Données mensuelles des cotisations

## Développement

Voir `plan.md` pour le plan de développement détaillé en 10 étapes.

**Étape actuelle :** Finitions & Optimisations UI/UX ✅

---

## Déploiement Railway (hébergement gratuit)

Le projet est un monorepo avec deux dossiers principaux : `frontend` (React) et `backend` (NodeJS/Express).

### 1. Déployer le backend (API NodeJS)
- Crée un nouveau projet sur https://railway.com
- Connecte ton repo GitHub ou utilise Railway CLI
- Choisis le dossier `backend` comme racine du service
- Ajoute une variable d'environnement si besoin (`PORT=3001` par défaut)
- Lance le service (Railway détecte automatiquement Express)

### 2. Déployer le frontend (React)
- Ajoute un nouveau service "Static Site" dans Railway
- Choisis le dossier `frontend` comme racine du service
- Commande de build : `npm run build`
- Dossier de sortie : `build`
- Configure l'URL de l'API backend dans le `.env` du frontend si besoin (`REACT_APP_API_URL`)

### 3. Structure du projet
```
/ (racine)
  /backend   # NodeJS/Express, API, fichiers JSON
  /frontend  # React, TailwindCSS
```

---

Pour plus de détails, voir le plan.md ou la documentation Railway.
