# GestionRH - Gestion des Ressources Humaines

Application web complète de gestion des ressources humaines construite avec **Node.js**, **Express**, **React** et **Tailwind CSS**.

## Fonctionnalités

- **Authentification** : Connexion / Inscription avec JWT
- **Dashboard** : Tableau de bord avec statistiques et vue d'ensemble
- **Gestion des employés** : CRUD complet avec recherche et filtres
- **Gestion des congés** : Demandes, approbation/refus
- **Suivi des présences** : Pointage, heures supplémentaires
- **Recrutement** : Gestion des candidatures avec pipeline
- **Évaluations** : Système de notation multi-critères
- **Gestion des tâches** : Vue Kanban avec priorités

## Stack technique

| Couche | Technologies |
|--------|-------------|
| Backend | Node.js, Express, SQLite (better-sqlite3), JWT, bcrypt |
| Frontend | React 18, Vite, Tailwind CSS v4, React Router, Lucide Icons, Recharts |
| Base de données | SQLite (portable, pas besoin de MySQL) |

## Installation

### Prérequis
- Node.js >= 18

### Backend

```bash
cd backend
npm install
npm start
```

Le serveur démarre sur `http://localhost:5000`

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Le frontend démarre sur `http://localhost:3000` avec proxy vers le backend.

## Compte de démo

- **Email** : `admin@gestionrh.com`
- **Mot de passe** : `admin123`

## Structure du projet

```
gestion_rh/
├── backend/
│   ├── server.js          # Point d'entrée Express
│   ├── database.js        # Configuration SQLite + seeds
│   ├── middleware/
│   │   └── auth.js        # Middleware JWT
│   └── routes/
│       ├── auth.js        # Login / Register
│       ├── employees.js   # CRUD Employés
│       ├── conges.js      # Gestion des congés
│       ├── presences.js   # Suivi présences
│       ├── recruitment.js # Recrutement
│       ├── evaluations.js # Évaluations
│       ├── taches.js      # Gestion des tâches
│       └── dashboard.js   # Statistiques dashboard
├── frontend/
│   ├── src/
│   │   ├── App.jsx        # Routes principales
│   │   ├── context/       # Auth context
│   │   ├── components/    # Layout, Modal
│   │   ├── pages/         # Pages de l'application
│   │   └── utils/         # API helper
│   └── ...
└── README.md
```
