// ============================================================
// routes/auth.js — Routes d'inscription et de connexion 2FA
// ============================================================

const express = require('express');
const router = express.Router();
const speakeasy = require('speakeasy');
const QRCode = require('qrcode');
const bcrypt = require('bcryptjs');
const fs = require('fs');
const path = require('path');

// Chemin vers le fichier de stockage des utilisateurs
const USERS_FILE = path.join(__dirname, '..', 'users.json');

// -------------------------------------------------------
// Fonctions utilitaires pour lire/écrire les utilisateurs
// -------------------------------------------------------

/** Lit et retourne la liste des utilisateurs depuis users.json */
function lireUtilisateurs() {
  const data = fs.readFileSync(USERS_FILE, 'utf-8');
  return JSON.parse(data);
}

/** Sauvegarde la liste des utilisateurs dans users.json */
function sauvegarderUtilisateurs(users) {
  fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2), 'utf-8');
}

// -------------------------------------------------------
// POST /auth/register — Inscription d'un nouvel utilisateur
// -------------------------------------------------------
router.post('/register', async (req, res) => {
  const { username, password } = req.body;

  // Validation basique des champs
  if (!username || !password) {
    return res.status(400).json({ error: 'Nom d\'utilisateur et mot de passe requis.' });
  }

  const users = lireUtilisateurs();

  // Vérifier si le nom d'utilisateur est déjà pris
  if (users.find(u => u.username === username)) {
    return res.status(409).json({ error: 'Ce nom d\'utilisateur est déjà utilisé.' });
  }

  // Hacher le mot de passe avec bcrypt (10 rounds de salage)
  const hashedPassword = await bcrypt.hash(password, 10);

  // Générer une clé secrète TOTP unique pour cet utilisateur
  const secret = speakeasy.generateSecret({
    name: `2FA-App (${username})` // nom affiché dans Google Authenticator
  });

  // Créer le nouvel utilisateur avec ses données
  const nouvelUtilisateur = {
    username,
    password: hashedPassword,
    secret: secret.base32,   // clé secrète encodée en base32
    tentativesEchouees: 0,   // compteur de tentatives de connexion échouées
    bloque: false            // statut de blocage du compte
  };

  // Sauvegarder l'utilisateur dans le fichier JSON
  users.push(nouvelUtilisateur);
  sauvegarderUtilisateurs(users);

  // Générer le QR code à partir de l'URL otpauth (format standard Google Authenticator)
  try {
    const qrCodeDataURL = await QRCode.toDataURL(secret.otpauth_url);
    return res.json({
      message: 'Inscription réussie ! Scannez le QR code avec Google Authenticator.',
      qrCode: qrCodeDataURL
    });
  } catch (err) {
    return res.status(500).json({ error: 'Erreur lors de la génération du QR code.' });
  }
});

// -------------------------------------------------------
// POST /auth/login — Étape 1 : vérification du mot de passe
// -------------------------------------------------------
router.post('/login', async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ error: 'Champs manquants.' });
  }

  const users = lireUtilisateurs();
  const user = users.find(u => u.username === username);

  // Utilisateur introuvable
  if (!user) {
    return res.status(401).json({ error: 'Identifiants incorrects.' });
  }

  // Vérifier si le compte est bloqué (3 tentatives échouées)
  if (user.bloque) {
    return res.status(403).json({ error: 'Compte bloqué après 3 tentatives échouées. Contactez l\'administrateur.' });
  }

  // Vérifier le mot de passe avec bcrypt
  const motDePasseValide = await bcrypt.compare(password, user.password);
  if (!motDePasseValide) {
    // Incrémenter le compteur d'échecs
    user.tentativesEchouees += 1;

    // Bloquer le compte si 3 tentatives échouées
    if (user.tentativesEchouees >= 3) {
      user.bloque = true;
      sauvegarderUtilisateurs(users);
      return res.status(403).json({ error: 'Compte bloqué après 3 tentatives échouées.' });
    }

    sauvegarderUtilisateurs(users);
    const restantes = 3 - user.tentativesEchouees;
    return res.status(401).json({ error: `Mot de passe incorrect. ${restantes} tentative(s) restante(s).` });
  }

  // Mot de passe correct → demander le code 2FA
  // On stocke temporairement le nom d'utilisateur en session pour l'étape 2
  req.session.pendingUser = username;

  return res.json({ message: 'Mot de passe correct. Veuillez entrer votre code 2FA.' });
});

// -------------------------------------------------------
// POST /auth/verify-2fa — Étape 2 : vérification du code TOTP
// -------------------------------------------------------
router.post('/verify-2fa', (req, res) => {
  const { token } = req.body;

  // Vérifier qu'une session d'attente existe (étape 1 complétée)
  if (!req.session.pendingUser) {
    return res.status(401).json({ error: 'Session expirée. Veuillez vous reconnecter.' });
  }

  const username = req.session.pendingUser;
  const users = lireUtilisateurs();
  const user = users.find(u => u.username === username);

  if (!user) {
    return res.status(401).json({ error: 'Utilisateur introuvable.' });
  }

  // Vérifier le code TOTP avec speakeasy (fenêtre de 1 = tolérance de ±30 secondes)
  const codeValide = speakeasy.totp.verify({
    secret: user.secret,
    encoding: 'base32',
    token: token,
    window: 1
  });

  if (!codeValide) {
    // Incrémenter les tentatives échouées pour le code 2FA aussi
    user.tentativesEchouees += 1;

    if (user.tentativesEchouees >= 3) {
      user.bloque = true;
      sauvegarderUtilisateurs(users);
      return res.status(403).json({ error: 'Compte bloqué après 3 tentatives échouées.' });
    }

    sauvegarderUtilisateurs(users);
    const restantes = 3 - user.tentativesEchouees;
    return res.status(401).json({ error: `Code 2FA incorrect. ${restantes} tentative(s) restante(s).` });
  }

  // Code valide → réinitialiser le compteur d'échecs et créer la session
  user.tentativesEchouees = 0;
  sauvegarderUtilisateurs(users);

  // Supprimer l'utilisateur en attente et créer la session authentifiée
  delete req.session.pendingUser;
  req.session.user = { username: user.username };

  return res.json({ message: 'Connexion réussie !', redirect: '/dashboard' });
});

// -------------------------------------------------------
// POST /auth/login-simple — Connexion SANS 2FA (démo)
// -------------------------------------------------------
router.post('/login-simple', async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ error: 'Champs manquants.' });
  }

  const users = lireUtilisateurs();
  const user = users.find(u => u.username === username);

  if (!user) {
    return res.status(401).json({ error: 'Identifiants incorrects.' });
  }

  // Vérifier uniquement le mot de passe, pas de 2FA
  const motDePasseValide = await bcrypt.compare(password, user.password);
  if (!motDePasseValide) {
    return res.status(401).json({ error: 'Mot de passe incorrect.' });
  }

  // Connexion directe sans étape 2FA
  req.session.user = { username: user.username };
  return res.json({ message: 'Connecté sans 2FA.' });
});

// -------------------------------------------------------
// POST /auth/logout — Déconnexion et destruction de la session
// -------------------------------------------------------
router.post('/logout', (req, res) => {
  req.session.destroy(() => {
    res.json({ message: 'Déconnecté avec succès.' });
  });
});

// -------------------------------------------------------
// GET /auth/me — Retourne l'utilisateur connecté (pour le dashboard)
// -------------------------------------------------------
router.get('/me', (req, res) => {
  if (!req.session.user) {
    return res.status(401).json({ error: 'Non authentifié.' });
  }
  res.json({ username: req.session.user.username });
});

module.exports = router;
