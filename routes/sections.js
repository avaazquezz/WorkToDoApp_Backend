const express = require('express');
const router = express.Router();
const pool = require('../db/db');

// Obtener todas las secciones de un proyecto
router.get('/project/:projectId', async (req, res) => {
  const { projectId } = req.params;
  try {
    const [results] = await pool.query('SELECT * FROM sections WHERE project_id = ?', [projectId]);
    res.json(results);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Obtener una sección por ID
router.get('/:idSection', async (req, res) => {
  const { idSection } = req.params;
  try {
    const [results] = await pool.query('SELECT * FROM sections WHERE idSection = ?', [idSection]);
    if (results.length === 0) return res.status(404).json({ error: 'Sección no encontrada' });
    res.json(results[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Crear nueva sección               
router.post('/', async (req, res) => {
  const { title, description, color, createdAt, project_id, user_id } = req.body;

  // Validar datos recibidos
  if (!title || !description || !color || !createdAt || !project_id || !user_id) {
    console.error('Error de validación: Faltan campos obligatorios.', req.body); // Log detallado
    return res.status(400).json({ error: 'Todos los campos son obligatorios.' });
  }

  console.log('Datos recibidos para crear sección:', req.body); // Log para depuración

  try {
    const [result] = await pool.query(
      'INSERT INTO sections (title, description, color, createdAt, project_id, user_id) VALUES (?, ?, ?, ?, ?, ?)',
      [title, description, color, createdAt, project_id, user_id]
    );
    res.status(201).json({ idSection: result.insertId });
  } catch (err) {
    console.error('Error al insertar sección en la base de datos:', err.message, err.stack); // Log más detallado
    res.status(500).json({ error: 'Error interno del servidor.', details: err.message });
  }
});

// Actualizar sección
router.put('/:idSection', async (req, res) => {
  const { idSection } = req.params;
  const { title, description, color } = req.body;
  try {
    await pool.query(
      'UPDATE sections SET title = ?, description = ?, color = ? WHERE idSection = ?',
      [title, description, color, idSection]
    );
    res.json({ message: 'Sección actualizada' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Eliminar sección
router.delete('/:idSection', async (req, res) => {
  const { idSection } = req.params;
  try {
    await pool.query('DELETE FROM sections WHERE idSection = ?', [idSection]);
    res.json({ message: 'Sección eliminada' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Obtener información de creación de una sección
router.get('/:idSection/creation-info', async (req, res) => {
  const { idSection } = req.params;
  try {
    const [results] = await pool.query(
      'SELECT sections.createdAt, users.name AS created_by FROM sections JOIN users ON sections.user_id = users.id WHERE sections.idSection = ?',
      [idSection]
    );
    if (!results || results.length === 0) {
      return res.status(404).json({ error: 'Información de creación no encontrada' });
    }
    res.json(results[0]);
  } catch (err) {
    console.error('Database Query Error:', err); // Log para depuración
    res.status(500).json({ error: 'Error interno del servidor', details: err.message });
  }
});

// Mover una sección a otro proyecto
router.put('/:idSection/move', async (req, res) => {
  const { idSection } = req.params;
  const { newProjectId } = req.body;
  try {
    await pool.query(
      'UPDATE sections SET project_id = ? WHERE idSection = ?',
      [newProjectId, idSection]
    );
    res.json({ message: 'Sección movida exitosamente' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Contar secciones por proyecto
router.get('/project/:projectId/count', async (req, res) => {
  const { projectId } = req.params;
  try {
    const [results] = await pool.query(
      'SELECT COUNT(*) AS totalSections FROM sections WHERE project_id = ?',
      [projectId]
    );
    res.json(results[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
