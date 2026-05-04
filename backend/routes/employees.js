const express = require('express');
const { getDb } = require('../database');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();
router.use(authenticateToken);

router.get('/', (req, res) => {
  try {
    const db = getDb();
    const { search, departement, statut } = req.query;
    let query = 'SELECT * FROM employees WHERE 1=1';
    const params = [];

    if (search) {
      query += ' AND (nom LIKE ? OR prenom LIKE ? OR email LIKE ? OR matricule LIKE ? OR poste LIKE ?)';
      const s = `%${search}%`;
      params.push(s, s, s, s, s);
    }
    if (departement) {
      query += ' AND departement = ?';
      params.push(departement);
    }
    if (statut) {
      query += ' AND statut = ?';
      params.push(statut);
    }

    query += ' ORDER BY id DESC';
    const employees = db.prepare(query).all(...params);
    res.json(employees);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/stats', (req, res) => {
  try {
    const db = getDb();
    const total = db.prepare('SELECT COUNT(*) as count FROM employees').get().count;
    const actifs = db.prepare("SELECT COUNT(*) as count FROM employees WHERE statut = 'actif'").get().count;
    const enConge = db.prepare("SELECT COUNT(*) as count FROM employees WHERE statut = 'en_conge'").get().count;
    const departements = db.prepare('SELECT departement, COUNT(*) as count FROM employees GROUP BY departement').all();
    res.json({ total, actifs, enConge, inactifs: total - actifs - enConge, departements });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/:id', (req, res) => {
  try {
    const db = getDb();
    const employee = db.prepare('SELECT * FROM employees WHERE id = ?').get(req.params.id);
    if (!employee) return res.status(404).json({ error: 'Employe non trouve' });
    res.json(employee);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/', (req, res) => {
  try {
    const db = getDb();
    const { matricule, nom, prenom, email, telephone, poste, departement, date_embauche, salaire, statut, adresse, date_naissance, genre } = req.body;

    if (!matricule || !nom || !prenom || !email) {
      return res.status(400).json({ error: 'Champs obligatoires manquants' });
    }

    const result = db.prepare(`
      INSERT INTO employees (matricule, nom, prenom, email, telephone, poste, departement, date_embauche, salaire, statut, adresse, date_naissance, genre)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(matricule, nom, prenom, email, telephone, poste, departement, date_embauche, salaire, statut || 'actif', adresse, date_naissance, genre);

    const employee = db.prepare('SELECT * FROM employees WHERE id = ?').get(result.lastInsertRowid);
    res.status(201).json(employee);
  } catch (err) {
    if (err.message.includes('UNIQUE')) {
      return res.status(409).json({ error: 'Matricule ou email deja utilise' });
    }
    res.status(500).json({ error: err.message });
  }
});

router.put('/:id', (req, res) => {
  try {
    const db = getDb();
    const { matricule, nom, prenom, email, telephone, poste, departement, date_embauche, salaire, statut, adresse, date_naissance, genre } = req.body;

    db.prepare(`
      UPDATE employees SET matricule=?, nom=?, prenom=?, email=?, telephone=?, poste=?, departement=?, date_embauche=?, salaire=?, statut=?, adresse=?, date_naissance=?, genre=?
      WHERE id=?
    `).run(matricule, nom, prenom, email, telephone, poste, departement, date_embauche, salaire, statut, adresse, date_naissance, genre, req.params.id);

    const employee = db.prepare('SELECT * FROM employees WHERE id = ?').get(req.params.id);
    res.json(employee);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/:id', (req, res) => {
  try {
    const db = getDb();
    db.prepare('DELETE FROM employees WHERE id = ?').run(req.params.id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
