const express = require('express');
const { getDb } = require('../database');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();
router.use(authenticateToken);

router.get('/', (req, res) => {
  try {
    const db = getDb();
    const { employee_id, statut, priorite } = req.query;
    let query = `SELECT t.*, e.nom, e.prenom, e.matricule 
                 FROM taches t JOIN employees e ON t.employee_id = e.id WHERE 1=1`;
    const params = [];

    if (employee_id) { query += ' AND t.employee_id = ?'; params.push(employee_id); }
    if (statut) { query += ' AND t.statut = ?'; params.push(statut); }
    if (priorite) { query += ' AND t.priorite = ?'; params.push(priorite); }

    query += ' ORDER BY t.date_tache DESC';
    res.json(db.prepare(query).all(...params));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/stats', (req, res) => {
  try {
    const db = getDb();
    const total = db.prepare('SELECT COUNT(*) as count FROM taches').get().count;
    const aFaire = db.prepare("SELECT COUNT(*) as count FROM taches WHERE statut = 'a_faire'").get().count;
    const enCours = db.prepare("SELECT COUNT(*) as count FROM taches WHERE statut = 'en_cours'").get().count;
    const terminees = db.prepare("SELECT COUNT(*) as count FROM taches WHERE statut = 'terminee'").get().count;
    const urgentes = db.prepare("SELECT COUNT(*) as count FROM taches WHERE priorite = 'urgente'").get().count;
    res.json({ total, aFaire, enCours, terminees, urgentes });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/', (req, res) => {
  try {
    const db = getDb();
    const { employee_id, titre, description, date_tache, date_echeance, priorite, statut } = req.body;

    const result = db.prepare(`
      INSERT INTO taches (employee_id, titre, description, date_tache, date_echeance, priorite, statut)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(employee_id, titre, description, date_tache, date_echeance, priorite || 'moyenne', statut || 'a_faire');

    const tache = db.prepare(`
      SELECT t.*, e.nom, e.prenom FROM taches t JOIN employees e ON t.employee_id = e.id WHERE t.id = ?
    `).get(result.lastInsertRowid);
    res.status(201).json(tache);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/:id', (req, res) => {
  try {
    const db = getDb();
    const data = req.body;

    if (data.statut && Object.keys(data).length <= 2) {
      db.prepare('UPDATE taches SET statut = ? WHERE id = ?').run(data.statut, req.params.id);
    } else {
      db.prepare(`
        UPDATE taches SET employee_id=?, titre=?, description=?, date_tache=?, date_echeance=?, priorite=?, statut=? WHERE id=?
      `).run(data.employee_id, data.titre, data.description, data.date_tache, data.date_echeance, data.priorite, data.statut, req.params.id);
    }

    const tache = db.prepare(`
      SELECT t.*, e.nom, e.prenom FROM taches t JOIN employees e ON t.employee_id = e.id WHERE t.id = ?
    `).get(req.params.id);
    res.json(tache);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/:id', (req, res) => {
  try {
    const db = getDb();
    db.prepare('DELETE FROM taches WHERE id = ?').run(req.params.id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
