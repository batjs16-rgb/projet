const express = require('express');
const { getDb } = require('../database');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();
router.use(authenticateToken);

router.get('/', (req, res) => {
  try {
    const db = getDb();
    const { statut, employee_id } = req.query;
    let query = `SELECT c.*, e.nom, e.prenom, e.matricule, e.departement 
                 FROM conges c JOIN employees e ON c.employee_id = e.id WHERE 1=1`;
    const params = [];

    if (statut) { query += ' AND c.statut = ?'; params.push(statut); }
    if (employee_id) { query += ' AND c.employee_id = ?'; params.push(employee_id); }

    query += ' ORDER BY c.date_debut DESC';
    res.json(db.prepare(query).all(...params));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/stats', (req, res) => {
  try {
    const db = getDb();
    const total = db.prepare('SELECT COUNT(*) as count FROM conges').get().count;
    const enAttente = db.prepare("SELECT COUNT(*) as count FROM conges WHERE statut = 'en_attente'").get().count;
    const approuves = db.prepare("SELECT COUNT(*) as count FROM conges WHERE statut = 'approuve'").get().count;
    const refuses = db.prepare("SELECT COUNT(*) as count FROM conges WHERE statut = 'refuse'").get().count;
    const parType = db.prepare('SELECT type_conge, COUNT(*) as count FROM conges GROUP BY type_conge').all();
    res.json({ total, enAttente, approuves, refuses, parType });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/', (req, res) => {
  try {
    const db = getDb();
    const { employee_id, type_conge, date_debut, date_fin, raison } = req.body;
    const result = db.prepare(
      'INSERT INTO conges (employee_id, type_conge, date_debut, date_fin, raison) VALUES (?, ?, ?, ?, ?)'
    ).run(employee_id, type_conge, date_debut, date_fin, raison);

    const conge = db.prepare(`
      SELECT c.*, e.nom, e.prenom FROM conges c JOIN employees e ON c.employee_id = e.id WHERE c.id = ?
    `).get(result.lastInsertRowid);
    res.status(201).json(conge);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/:id', (req, res) => {
  try {
    const db = getDb();
    const { statut } = req.body;
    db.prepare('UPDATE conges SET statut = ? WHERE id = ?').run(statut, req.params.id);
    const conge = db.prepare(`
      SELECT c.*, e.nom, e.prenom FROM conges c JOIN employees e ON c.employee_id = e.id WHERE c.id = ?
    `).get(req.params.id);
    res.json(conge);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/:id', (req, res) => {
  try {
    const db = getDb();
    db.prepare('DELETE FROM conges WHERE id = ?').run(req.params.id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
