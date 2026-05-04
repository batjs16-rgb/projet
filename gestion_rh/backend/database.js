const Database = require('better-sqlite3');
const path = require('path');
const bcrypt = require('bcryptjs');

const DB_PATH = path.join(__dirname, 'gestion_rh.db');

let db;

function getDb() {
  if (!db) {
    db = new Database(DB_PATH);
    db.pragma('journal_mode = WAL');
    db.pragma('foreign_keys = ON');
  }
  return db;
}

function initDatabase() {
  const db = getDb();

  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      role TEXT DEFAULT 'user' CHECK(role IN ('admin','manager','user')),
      nom TEXT,
      prenom TEXT,
      avatar TEXT,
      created_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS employees (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      matricule TEXT UNIQUE NOT NULL,
      nom TEXT NOT NULL,
      prenom TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      telephone TEXT,
      poste TEXT,
      departement TEXT,
      date_embauche TEXT,
      salaire REAL,
      statut TEXT DEFAULT 'actif' CHECK(statut IN ('actif','inactif','en_conge')),
      photo TEXT,
      adresse TEXT,
      date_naissance TEXT,
      genre TEXT CHECK(genre IN ('homme','femme','autre')),
      created_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS candidats (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nom TEXT NOT NULL,
      prenom TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      telephone TEXT,
      poste_demande TEXT,
      experience INTEGER,
      statut TEXT DEFAULT 'en_attente' CHECK(statut IN ('en_attente','entretien','accepte','refuse')),
      date_candidature TEXT,
      cv_path TEXT,
      notes TEXT,
      created_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS conges (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      employee_id INTEGER NOT NULL,
      type_conge TEXT NOT NULL CHECK(type_conge IN ('annuel','maladie','sans_solde','maternite','paternite','formation')),
      date_debut TEXT NOT NULL,
      date_fin TEXT NOT NULL,
      statut TEXT DEFAULT 'en_attente' CHECK(statut IN ('en_attente','approuve','refuse')),
      raison TEXT,
      created_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS presences (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      employee_id INTEGER NOT NULL,
      date TEXT NOT NULL,
      heure_arrivee TEXT,
      heure_depart TEXT,
      statut TEXT DEFAULT 'present' CHECK(statut IN ('present','absent','retard','conge')),
      heures_sup REAL DEFAULT 0,
      FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE,
      UNIQUE(employee_id, date)
    );

    CREATE TABLE IF NOT EXISTS evaluations (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      employee_id INTEGER NOT NULL,
      date_evaluation TEXT NOT NULL,
      evaluateur TEXT,
      note_globale REAL CHECK(note_globale >= 0 AND note_globale <= 10),
      competence_technique REAL,
      communication REAL,
      travail_equipe REAL,
      ponctualite REAL,
      initiative REAL,
      commentaires TEXT,
      created_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS taches (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      employee_id INTEGER NOT NULL,
      titre TEXT NOT NULL,
      description TEXT,
      date_tache TEXT NOT NULL,
      date_echeance TEXT,
      priorite TEXT DEFAULT 'moyenne' CHECK(priorite IN ('basse','moyenne','haute','urgente')),
      statut TEXT DEFAULT 'a_faire' CHECK(statut IN ('a_faire','en_cours','terminee','annulee')),
      created_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE
    );
  `);

  // Seed admin user if none exists
  const userCount = db.prepare('SELECT COUNT(*) as count FROM users').get();
  if (userCount.count === 0) {
    const hash = bcrypt.hashSync('admin123', 10);
    db.prepare(`
      INSERT INTO users (username, email, password, role, nom, prenom)
      VALUES ('admin', 'admin@gestionrh.com', ?, 'admin', 'Admin', 'System')
    `).run(hash);
  }

  // Seed employees if none exist
  const empCount = db.prepare('SELECT COUNT(*) as count FROM employees').get();
  if (empCount.count === 0) {
    const employees = [
      ['EMP001', 'Dupont', 'Jean', 'jean.dupont@email.com', '0612345678', 'Developpeur Senior', 'IT', '2023-01-15', 42000, 'actif'],
      ['EMP002', 'Martin', 'Sophie', 'sophie.martin@email.com', '0623456789', 'Responsable RH', 'Ressources Humaines', '2022-03-20', 48000, 'actif'],
      ['EMP003', 'Bernard', 'Lucas', 'lucas.bernard@email.com', '0634567890', 'Commercial Senior', 'Ventes', '2023-06-10', 38000, 'actif'],
      ['EMP004', 'Petit', 'Marie', 'marie.petit@email.com', '0645678901', 'Designer UI/UX', 'Design', '2023-09-01', 40000, 'actif'],
      ['EMP005', 'Robert', 'Pierre', 'pierre.robert@email.com', '0656789012', 'Chef de Projet', 'Management', '2021-11-05', 52000, 'actif'],
      ['EMP006', 'Moreau', 'Claire', 'claire.moreau@email.com', '0667890123', 'Comptable', 'Finance', '2022-07-15', 36000, 'actif'],
      ['EMP007', 'Leroy', 'Thomas', 'thomas.leroy@email.com', '0678901234', 'Developpeur Junior', 'IT', '2024-01-10', 32000, 'actif'],
      ['EMP008', 'Simon', 'Julie', 'julie.simon@email.com', '0689012345', 'Marketing Manager', 'Marketing', '2022-05-20', 45000, 'en_conge'],
    ];

    const insert = db.prepare(`
      INSERT INTO employees (matricule, nom, prenom, email, telephone, poste, departement, date_embauche, salaire, statut)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    for (const emp of employees) {
      insert.run(...emp);
    }

    // Seed some leaves
    db.prepare(`INSERT INTO conges (employee_id, type_conge, date_debut, date_fin, statut, raison) VALUES (1, 'annuel', '2024-08-01', '2024-08-15', 'approuve', 'Vacances ete')`).run();
    db.prepare(`INSERT INTO conges (employee_id, type_conge, date_debut, date_fin, statut, raison) VALUES (2, 'maladie', '2024-07-10', '2024-07-12', 'approuve', 'Grippe')`).run();
    db.prepare(`INSERT INTO conges (employee_id, type_conge, date_debut, date_fin, statut, raison) VALUES (3, 'annuel', '2024-09-01', '2024-09-10', 'en_attente', 'Voyage personnel')`).run();
    db.prepare(`INSERT INTO conges (employee_id, type_conge, date_debut, date_fin, statut, raison) VALUES (8, 'maternite', '2024-06-01', '2024-09-01', 'approuve', 'Conge maternite')`).run();

    // Seed some candidats
    db.prepare(`INSERT INTO candidats (nom, prenom, email, telephone, poste_demande, experience, statut, date_candidature) VALUES ('Dubois', 'Antoine', 'antoine.dubois@email.com', '0611111111', 'Developpeur Full Stack', 3, 'entretien', '2024-07-15')`).run();
    db.prepare(`INSERT INTO candidats (nom, prenom, email, telephone, poste_demande, experience, statut, date_candidature) VALUES ('Garcia', 'Elena', 'elena.garcia@email.com', '0622222222', 'Data Analyst', 5, 'en_attente', '2024-07-20')`).run();
    db.prepare(`INSERT INTO candidats (nom, prenom, email, telephone, poste_demande, experience, statut, date_candidature) VALUES ('Faure', 'Maxime', 'maxime.faure@email.com', '0633333333', 'DevOps Engineer', 4, 'accepte', '2024-06-10')`).run();

    // Seed evaluations
    db.prepare(`INSERT INTO evaluations (employee_id, date_evaluation, evaluateur, note_globale, competence_technique, communication, travail_equipe, ponctualite, initiative, commentaires) VALUES (1, '2024-06-15', 'Pierre Robert', 8.5, 9.0, 8.0, 8.5, 8.0, 9.0, 'Excellent developpeur, tres implique')`).run();
    db.prepare(`INSERT INTO evaluations (employee_id, date_evaluation, evaluateur, note_globale, competence_technique, communication, travail_equipe, ponctualite, initiative, commentaires) VALUES (2, '2024-06-15', 'Pierre Robert', 9.0, 8.5, 9.5, 9.0, 9.0, 9.0, 'Tres bonne communication et leadership')`).run();
    db.prepare(`INSERT INTO evaluations (employee_id, date_evaluation, evaluateur, note_globale, competence_technique, communication, travail_equipe, ponctualite, initiative, commentaires) VALUES (3, '2024-06-15', 'Sophie Martin', 7.0, 6.5, 8.0, 7.5, 6.0, 7.0, 'Bon commercial, peut ameliorer la ponctualite')`).run();

    // Seed presences for today-like dates
    db.prepare(`INSERT INTO presences (employee_id, date, heure_arrivee, heure_depart, statut) VALUES (1, '2024-07-22', '08:30', '17:30', 'present')`).run();
    db.prepare(`INSERT INTO presences (employee_id, date, heure_arrivee, heure_depart, statut) VALUES (2, '2024-07-22', '09:00', '18:00', 'present')`).run();
    db.prepare(`INSERT INTO presences (employee_id, date, heure_arrivee, heure_depart, statut) VALUES (3, '2024-07-22', '09:15', '17:45', 'retard')`).run();
    db.prepare(`INSERT INTO presences (employee_id, date, heure_arrivee, heure_depart, statut, heures_sup) VALUES (5, '2024-07-22', '08:00', '19:00', 'present', 2)`).run();

    // Seed tasks
    db.prepare(`INSERT INTO taches (employee_id, titre, description, date_tache, date_echeance, priorite, statut) VALUES (1, 'Migration API v2', 'Migrer les endpoints vers la v2', '2024-07-20', '2024-08-15', 'haute', 'en_cours')`).run();
    db.prepare(`INSERT INTO taches (employee_id, titre, description, date_tache, date_echeance, priorite, statut) VALUES (4, 'Redesign Dashboard', 'Refonte du design du tableau de bord', '2024-07-18', '2024-08-01', 'urgente', 'en_cours')`).run();
    db.prepare(`INSERT INTO taches (employee_id, titre, description, date_tache, date_echeance, priorite, statut) VALUES (2, 'Revue salariale Q3', 'Preparer la revue salariale du trimestre', '2024-07-15', '2024-07-30', 'haute', 'a_faire')`).run();
    db.prepare(`INSERT INTO taches (employee_id, titre, description, date_tache, date_echeance, priorite, statut) VALUES (7, 'Formation React', 'Completer la formation React avancee', '2024-07-22', '2024-08-30', 'moyenne', 'a_faire')`).run();
  }

  return db;
}

module.exports = { getDb, initDatabase };
