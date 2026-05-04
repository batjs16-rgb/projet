const express = require('express');
const { getDb } = require('../database');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();
router.use(authenticateToken);

router.get('/', (req, res) => {
  try {
    const db = getDb();
    const { employee_id, date, statut } = req.query;
    let query = `SELECT p.*, e.nom, e.prenom, e.matricule, e.departement 
                 FROM presences p JOIN employees e ON p.employee_id = e.id WHERE 1=1`;
    const params = [];

    if (employee_id) { query += ' AND p.employee_id = ?'; params.push(employee_id); }
    if (date) { query += ' AND p.date = ?'; params.push(date); }
    if (statut) { query += ' AND p.statut = ?'; params.push(statut); }

    query += ' ORDER BY p.date DESC, e.nom ASC LIMIT 200';
    res.json(db.prepare(query).all(...params));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/stats', (req, res) => {
  try {
    const db = getDb();
    const total = db.prepare('SELECT COUNT(*) as count FROM presences').get().count;
    const presents = db.prepare("SELECT COUNT(*) as count FROM presences WHERE statut = 'present'").get().count;
    const absents = db.prepare("SELECT COUNT(*) as count FROM presences WHERE statut = 'absent'").get().count;
    const retards = db.prepare("SELECT COUNT(*) as count FROM presences WHERE statut = 'retard'").get().count;
    res.json({ total, presents, absents, retards });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/', (req, res) => {
  try {
    const db = getDb();
    const { employee_id, date, heure_arrivee, heure_depart, statut, heures_sup } = req.body;

    const existing = db.prepare('SELECT id FROM presences WHERE employee_id = ? AND date = ?').get(employee_id, date);

    if (existing) {
      db.prepare('UPDATE presences SET heure_arrivee=?, heure_depart=?, statut=?, heures_sup=? WHERE id=?')
        .run(heure_arrivee, heure_depart, statut, heures_sup || 0, existing.id);
    } else {
      db.prepare('INSERT INTO presences (employee_id, date, heure_arrivee, heure_depart, statut, heures_sup) VALUES (?, ?, ?, ?, ?, ?)')
        .run(employee_id, date, heure_arrivee, heure_depart, statut, heures_sup || 0);
    }

    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/:id', (req, res) => {
  try {
    const db = getDb();
    db.prepare('DELETE FROM presences WHERE id = ?').run(req.params.id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
