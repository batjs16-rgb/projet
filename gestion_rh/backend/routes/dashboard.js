const express = require('express');
const { getDb } = require('../database');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();
router.use(authenticateToken);

router.get('/', (req, res) => {
  try {
    const db = getDb();

    const totalEmployees = db.prepare('SELECT COUNT(*) as count FROM employees').get().count;
    const employeesActifs = db.prepare("SELECT COUNT(*) as count FROM employees WHERE statut = 'actif'").get().count;
    const employeesEnConge = db.prepare("SELECT COUNT(*) as count FROM employees WHERE statut = 'en_conge'").get().count;

    const congesEnAttente = db.prepare("SELECT COUNT(*) as count FROM conges WHERE statut = 'en_attente'").get().count;
    const totalConges = db.prepare('SELECT COUNT(*) as count FROM conges').get().count;

    const totalCandidats = db.prepare('SELECT COUNT(*) as count FROM candidats').get().count;
    const candidatsEnAttente = db.prepare("SELECT COUNT(*) as count FROM candidats WHERE statut = 'en_attente'").get().count;

    const tachesEnCours = db.prepare("SELECT COUNT(*) as count FROM taches WHERE statut = 'en_cours'").get().count;
    const tachesUrgentes = db.prepare("SELECT COUNT(*) as count FROM taches WHERE priorite = 'urgente'").get().count;

    const avgEvaluation = db.prepare('SELECT AVG(note_globale) as avg FROM evaluations').get().avg || 0;

    const departements = db.prepare('SELECT departement, COUNT(*) as count FROM employees GROUP BY departement ORDER BY count DESC').all();

    const recentEmployees = db.prepare('SELECT id, nom, prenom, poste, departement, date_embauche FROM employees ORDER BY created_at DESC LIMIT 5').all();

    const recentConges = db.prepare(`
      SELECT c.id, c.type_conge, c.date_debut, c.date_fin, c.statut, e.nom, e.prenom 
      FROM conges c JOIN employees e ON c.employee_id = e.id 
      ORDER BY c.created_at DESC LIMIT 5
    `).all();

    const recentCandidats = db.prepare('SELECT id, nom, prenom, poste_demande, statut, date_candidature FROM candidats ORDER BY created_at DESC LIMIT 5').all();

    const tachesRecentes = db.prepare(`
      SELECT t.id, t.titre, t.priorite, t.statut, t.date_echeance, e.nom, e.prenom
      FROM taches t JOIN employees e ON t.employee_id = e.id
      ORDER BY t.created_at DESC LIMIT 5
    `).all();

    res.json({
      stats: {
        totalEmployees,
        employeesActifs,
        employeesEnConge,
        congesEnAttente,
        totalConges,
        totalCandidats,
        candidatsEnAttente,
        tachesEnCours,
        tachesUrgentes,
        avgEvaluation: Math.round(avgEvaluation * 10) / 10,
      },
      departements,
      recentEmployees,
      recentConges,
      recentCandidats,
      tachesRecentes,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
