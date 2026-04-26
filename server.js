// ============================================================
// server.js — Point d'entrée principal du serveur Express
// ============================================================

const express = require('express');
const session = require('express-session');
const path = require('path');

const authRoutes = require('./routes/auth');

const app = express();
const PORT = 3000;

// --- Middleware pour parser le JSON et les formulaires ---
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// --- Middleware de session (stockage en mémoire, suffisant pour ce projet) ---
app.use(session({
  secret: 'secret_2fa_super_securise', // clé de signature de la session
  resave: false,
  saveUninitialized: false,
  cookie: {
    maxAge: 1000 * 60 * 60 // session valide 1 heure
  }
}));

// --- Servir les fichiers statiques (HTML/CSS) depuis le dossier public ---
app.use(express.static(path.join(__dirname, 'public')));

// --- Monter les routes d'authentification sous /auth ---
app.use('/auth', authRoutes);

// --- Route protégée : tableau de bord (nécessite une session active) ---
app.get('/dashboard', (req, res) => {
  if (!req.session.user) {
    // Redirige vers la page de connexion si non authentifié
    return res.redirect('/');
  }
  res.sendFile(path.join(__dirname, 'public', 'dashboard.html'));
});

// --- Démarrage du serveur ---
app.listen(PORT, () => {
  console.log(`✅ Serveur démarré sur http://localhost:${PORT}`);
});
