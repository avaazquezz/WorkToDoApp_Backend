const express = require('express');
const router = express.Router();
const db = require('../db/db');

// Obtener todas las secciones de un proyecto
router.get('/project/:projectId', (req, res) => {
  const { projectId } = req.params;
  db.query('SELECT * FROM sections WHERE project_id = ?', [projectId], (err, results) => {
    if (err) return res.status(500).json({ error: err });
    res.json(results);
  });
});

// Obtener una sección por ID
router.get('/:idSection', (req, res) => {
  const { idSection } = req.params;
  db.query('SELECT * FROM sections WHERE idSection = ?', [idSection], (err, results) => {
    if (err) return res.status(500).json({ error: err });
    if (results.length === 0) return res.status(404).json({ error: 'Sección no encontrada' });
    res.json(results[0]);
  });
});

// Crear nueva sección
router.post('/', (req, res) => {
  const { title, description, color, createdAt, project_id, user_id } = req.body;
  db.query(
    'INSERT INTO sections (title, description, color, createdAt, project_id, user_id) VALUES (?, ?, ?, ?, ?, ?)',
    [title, description, color, createdAt, project_id, user_id],
    (err, result) => {
      if (err) return res.status(500).json({ error: err });
      res.status(201).json({ idSection: result.insertId });
    }
  );
});

// Actualizar sección
router.put('/:idSection', (req, res) => {
  const { idSection } = req.params;
  const { title, description, color } = req.body;
  db.query(
    'UPDATE sections SET title = ?, description = ?, color = ? WHERE idSection = ?',
    [title, description, color, idSection],
    (err, result) => {
      if (err) return res.status(500).json({ error: err });
      res.json({ message: 'Sección actualizada' });
    }
  );
});

// Eliminar sección
router.delete('/:idSection', (req, res) => {
  const { idSection } = req.params;
  db.query('DELETE FROM sections WHERE idSection = ?', [idSection], (err, result) => {
    if (err) return res.status(500).json({ error: err });
    res.json({ message: 'Sección eliminada' });
  });
});

// Obtener información de creación de una sección
router.get('/:idSection/creation-info', (req, res) => {
  const { idSection } = req.params;
  db.query(
    'SELECT sections.createdAt, users.name AS created_by FROM sections JOIN users ON sections.user_id = users.id WHERE sections.idSection = ?',
    [idSection],
    (err, results) => {
      if (err) return res.status(500).json({ error: err });
      if (results.length === 0) return res.status(404).json({ error: 'Información de creación no encontrada' });
      res.json(results[0]);
    }
  );
});

// Mover una sección a otro proyecto
router.put('/:idSection/move', (req, res) => {
  const { idSection } = req.params;
  const { newProjectId } = req.body;
  db.query(
    'UPDATE sections SET project_id = ? WHERE idSection = ?',
    [newProjectId, idSection],
    (err, result) => {
      if (err) return res.status(500).json({ error: err });
      res.json({ message: 'Sección movida exitosamente' });
    }
  );
});

// Contar secciones por proyecto
router.get('/project/:projectId/count', (req, res) => {
  const { projectId } = req.params;
  db.query(
    'SELECT COUNT(*) AS totalSections FROM sections WHERE project_id = ?',
    [projectId],
    (err, results) => {
      if (err) return res.status(500).json({ error: err });
      res.json(results[0]);
    }
  );
});

module.exports = router;
