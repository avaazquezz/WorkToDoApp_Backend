const express = require('express');
const router = express.Router();
const db = require('../db/db');

// Obtener todos los proyectos de un usuario
router.get('/:userId', (req, res) => {
  const { userId } = req.params;
  db.query('SELECT * FROM projects WHERE created_by = ?', [userId], (err, results) => {
    if (err) return res.status(500).json({ error: err });
    res.json(results);
  });
});

// Obtener un proyecto por ID
router.get('/project/:id', (req, res) => {
  const { id } = req.params;
  db.query('SELECT * FROM projects WHERE id = ?', [id], (err, results) => {
    if (err) return res.status(500).json({ error: err });
    if (results.length === 0) return res.status(404).json({ error: 'Proyecto no encontrado' });
    res.json(results[0]);
  });
});

// Crear nuevo proyecto
router.post('/', (req, res) => {
  const { name, color, created_by, created_at } = req.body;
  db.query(
    'INSERT INTO projects (name, color, created_by, created_at) VALUES (?, ?, ?, ?)',
    [name, color, created_by, created_at],
    (err, result) => {
      if (err) return res.status(500).json({ error: err });
      res.status(201).json({ id: result.insertId });
    }
  );
});

// Actualizar un proyecto
router.put('/:id', (req, res) => {
  const { id } = req.params;
  const { name, color } = req.body;
  db.query(
    'UPDATE projects SET name = ?, color = ? WHERE id = ?',
    [name, color, id],
    (err, result) => {
      if (err) return res.status(500).json({ error: err });
      res.json({ message: 'Proyecto actualizado' });
    }
  );
});

// Eliminar un proyecto
router.delete('/:id', (req, res) => {
  const { id } = req.params;
  db.query('DELETE FROM projects WHERE id = ?', [id], (err, result) => {
    if (err) return res.status(500).json({ error: err });
    res.json({ message: 'Proyecto eliminado' });
  });
});

// Obtener información de creación de un proyecto
router.get('/project/:id/creation-info', (req, res) => {
  const { id } = req.params;
  db.query(
    'SELECT projects.created_at, users.name AS created_by FROM projects JOIN users ON projects.created_by = users.id WHERE projects.id = ?',
    [id],
    (err, results) => {
      if (err) return res.status(500).json({ error: err });
      if (results.length === 0) return res.status(404).json({ error: 'Información de creación no encontrada' });
      res.json(results[0]);
    }
  );
});

// Obtener estadísticas de proyectos
router.get('/stats', (req, res) => {
  db.query(
    'SELECT users.id AS userId, users.name AS userName, COUNT(projects.id) AS totalProjects FROM users LEFT JOIN projects ON users.id = projects.created_by GROUP BY users.id',
    (err, results) => {
      if (err) return res.status(500).json({ error: err });
      res.json(results);
    }
  );
});

module.exports = router;
