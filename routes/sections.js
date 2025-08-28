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

// Crear nueva sección (ruta general)             
router.post('/', async (req, res) => {
  const { title, description, color, createdAt, project_id, user_id } = req.body;

  // Validar datos recibidos
  if (!title || !project_id || !user_id) {
    console.error('Error de validación: Faltan campos obligatorios.', { 
      projectId: project_id, 
      body: req.body 
    });
    return res.status(400).json({ 
      error: 'Los campos title, projectId (param) y user_id son obligatorios',
      received: { projectId: project_id, body: req.body }
    });
  }

  const sectionData = {
    title,
    description: description || '',
    color: color || '#3B82F6',
    createdAt: createdAt || Date.now(),
    project_id,
    user_id
  };

  console.log('Datos para crear sección:', sectionData);

  try {
    const [result] = await pool.query(
      'INSERT INTO sections (title, description, color, createdAt, project_id, user_id) VALUES (?, ?, ?, ?, ?, ?)',
      [sectionData.title, sectionData.description, sectionData.color, sectionData.createdAt, sectionData.project_id, sectionData.user_id]
    );
    console.log('Sección creada con ID:', result.insertId);
    res.status(201).json({ idSection: result.insertId, message: 'Sección creada exitosamente' });
  } catch (err) {
    console.error('Error al insertar sección en la base de datos:', err.message);
    res.status(500).json({ error: 'Error interno del servidor.', details: err.message });
  }
});

// Crear nueva sección específica de un proyecto (ruta REST-style)
router.post('/project/:projectId', async (req, res) => {
  const { projectId } = req.params;
  const { title, description, color, createdAt, user_id } = req.body;

  // Validar datos recibidos
  if (!title || !user_id) {
    console.error('Error de validación: Faltan campos obligatorios.', { 
      projectId, 
      body: req.body 
    });
    return res.status(400).json({ 
      error: 'Los campos title, projectId (param) y user_id son obligatorios',
      received: { projectId, body: req.body }
    });
  }

  const sectionData = {
    title,
    description: description || '',
    color: color || '#3B82F6',
    createdAt: createdAt || Date.now(),
    project_id: parseInt(projectId),
    user_id
  };

  console.log('Datos para crear sección en proyecto:', sectionData);

  try {
    const [result] = await pool.query(
      'INSERT INTO sections (title, description, color, createdAt, project_id, user_id) VALUES (?, ?, ?, ?, ?, ?)',
      [sectionData.title, sectionData.description, sectionData.color, sectionData.createdAt, sectionData.project_id, sectionData.user_id]
    );
    console.log('Sección creada con ID:', result.insertId);
    res.status(201).json({ idSection: result.insertId, message: 'Sección creada exitosamente' });
  } catch (err) {
    console.error('Error al insertar sección en la base de datos:', err.message);
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
