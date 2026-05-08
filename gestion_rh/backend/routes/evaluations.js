const express = require('express');
const { getDb } = require('../database');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();
router.use(authenticateToken);

router.get('/', (req, res) => {
  try {
    const db = getDb();
    const { employee_id } = req.query;
    let query = `SELECT e.*, emp.nom, emp.prenom, emp.matricule, emp.departement 
                 FROM evaluations e JOIN employees emp ON e.employee_id = emp.id WHERE 1=1`;
    const params = [];

    if (employee_id) { query += ' AND e.employee_id = ?'; params.push(employee_id); }

    query += ' ORDER BY e.date_evaluation DESC';
    res.json(db.prepare(query).all(...params));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/stats', (req, res) => {
  try {
    const db = getDb();
    const total = db.prepare('SELECT COUNT(*) as count FROM evaluations').get().count;
    const avgNote = db.prepare('SELECT AVG(note_globale) as avg FROM evaluations').get().avg || 0;
    const topPerformers = db.prepare(`
      SELECT e.*, emp.nom, emp.prenom FROM evaluations e 
      JOIN employees emp ON e.employee_id = emp.id 
      ORDER BY e.note_globale DESC LIMIT 5
    `).all();
    res.json({ total, avgNote: Math.round(avgNote * 100) / 100, topPerformers });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/', (req, res) => {
  try {
    const db = getDb();
    const { employee_id, date_evaluation, evaluateur, competence_technique, communication, travail_equipe, ponctualite, initiative, commentaires } = req.body;

    const scores = [competence_technique, communication, travail_equipe, ponctualite, initiative].filter(s => s != null);
    const note_globale = scores.length > 0 ? Math.round((scores.reduce((a, b) => a + b, 0) / scores.length) * 100) / 100 : 0;

    const result = db.prepare(`
      INSERT INTO evaluations (employee_id, date_evaluation, evaluateur, note_globale, competence_technique, communication, travail_equipe, ponctualite, initiative, commentaires)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(employee_id, date_evaluation, evaluateur, note_globale, competence_technique, communication, travail_equipe, ponctualite, initiative, commentaires);

    const evaluation = db.prepare(`
      SELECT e.*, emp.nom, emp.prenom FROM evaluations e JOIN employees emp ON e.employee_id = emp.id WHERE e.id = ?
    `).get(result.lastInsertRowid);
    res.status(201).json(evaluation);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/:id', (req, res) => {
  try {
    const db = getDb();
    const { date_evaluation, evaluateur, competence_technique, communication, travail_equipe, ponctualite, initiative, commentaires } = req.body;

    const scores = [competence_technique, communication, travail_equipe, ponctualite, initiative].filter(s => s != null);
    const note_globale = scores.length > 0 ? Math.round((scores.reduce((a, b) => a + b, 0) / scores.length) * 100) / 100 : 0;

    db.prepare(`
      UPDATE evaluations SET date_evaluation=?, evaluateur=?, note_globale=?, competence_technique=?, communication=?, travail_equipe=?, ponctualite=?, initiative=?, commentaires=?
      WHERE id=?
    `).run(date_evaluation, evaluateur, note_globale, competence_technique, communication, travail_equipe, ponctualite, initiative, commentaires, req.params.id);

    const evaluation = db.prepare(`
      SELECT e.*, emp.nom, emp.prenom FROM evaluations e JOIN employees emp ON e.employee_id = emp.id WHERE e.id = ?
    `).get(req.params.id);
    res.json(evaluation);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/:id', (req, res) => {
  try {
    const db = getDb();
    db.prepare('DELETE FROM evaluations WHERE id = ?').run(req.params.id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
