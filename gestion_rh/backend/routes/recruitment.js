const express = require('express');
const { getDb } = require('../database');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();
router.use(authenticateToken);

router.get('/', (req, res) => {
  try {
    const db = getDb();
    const { statut, search } = req.query;
    let query = 'SELECT * FROM candidats WHERE 1=1';
    const params = [];

    if (statut) { query += ' AND statut = ?'; params.push(statut); }
    if (search) {
      query += ' AND (nom LIKE ? OR prenom LIKE ? OR email LIKE ? OR poste_demande LIKE ?)';
      const s = `%${search}%`;
      params.push(s, s, s, s);
    }

    query += ' ORDER BY date_candidature DESC';
    res.json(db.prepare(query).all(...params));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/stats', (req, res) => {
  try {
    const db = getDb();
    const total = db.prepare('SELECT COUNT(*) as count FROM candidats').get().count;
    const enAttente = db.prepare("SELECT COUNT(*) as count FROM candidats WHERE statut = 'en_attente'").get().count;
    const entretien = db.prepare("SELECT COUNT(*) as count FROM candidats WHERE statut = 'entretien'").get().count;
    const acceptes = db.prepare("SELECT COUNT(*) as count FROM candidats WHERE statut = 'accepte'").get().count;
    const refuses = db.prepare("SELECT COUNT(*) as count FROM candidats WHERE statut = 'refuse'").get().count;
    res.json({ total, enAttente, entretien, acceptes, refuses });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/', (req, res) => {
  try {
    const db = getDb();
    const { nom, prenom, email, telephone, poste_demande, experience, notes } = req.body;
    const today = new Date().toISOString().split('T')[0];

    const result = db.prepare(
      'INSERT INTO candidats (nom, prenom, email, telephone, poste_demande, experience, date_candidature, notes) VALUES (?, ?, ?, ?, ?, ?, ?, ?)'
    ).run(nom, prenom, email, telephone, poste_demande, experience, today, notes);

    const candidat = db.prepare('SELECT * FROM candidats WHERE id = ?').get(result.lastInsertRowid);
    res.status(201).json(candidat);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/:id', (req, res) => {
  try {
    const db = getDb();
    const data = req.body;

    if (data.statut && Object.keys(data).length <= 2) {
      db.prepare('UPDATE candidats SET statut = ? WHERE id = ?').run(data.statut, req.params.id);
    } else {
      db.prepare(`
        UPDATE candidats SET nom=?, prenom=?, email=?, telephone=?, poste_demande=?, experience=?, notes=? WHERE id=?
      `).run(data.nom, data.prenom, data.email, data.telephone, data.poste_demande, data.experience, data.notes, req.params.id);
    }

    const candidat = db.prepare('SELECT * FROM candidats WHERE id = ?').get(req.params.id);
    res.json(candidat);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/:id', (req, res) => {
  try {
    const db = getDb();
    db.prepare('DELETE FROM candidats WHERE id = ?').run(req.params.id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
