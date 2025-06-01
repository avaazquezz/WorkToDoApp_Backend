const express = require('express');
const router = express.Router();
const pool = require('../db/db');

// Obtener todos los proyectos de un usuario
router.get('/user/:userId', async (req, res) => {
  const { userId } = req.params;
  try {
    const [results] = await pool.query('SELECT * FROM projects WHERE created_by = ?', [userId]);
    res.json(results);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Obtener un proyecto por ID
router.get('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    // Validar que el ID sea un número
    if (isNaN(id)) {
      return res.status(400).json({ error: 'El ID del proyecto debe ser un número válido' });
    }
    const [results] = await pool.query('SELECT * FROM projects WHERE id = ?', [id]);
    if (results.length === 0) {
      return res.status(404).json({ error: 'Proyecto no encontrado' });
    }
    res.json(results[0]);
  } catch (err) {
    res.status(500).json({ error: 'Error interno del servidor', details: err.message });
  }
});

// Crear nuevo proyecto
router.post('/', async (req, res) => {
  const { name, color, created_by } = req.body;
  const created_at = Date.now();
  try {
    const [result] = await pool.query(
      'INSERT INTO projects (name, color, created_by, created_at) VALUES (?, ?, ?, ?)',
      [name, color, created_by, created_at]
    );
    res.status(201).json({ id: result.insertId, message: 'Proyecto creado exitosamente' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Actualizar un proyecto
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { name, color } = req.body;
  try {
    await pool.query(
      'UPDATE projects SET name = ?, color = ? WHERE id = ?',
      [name, color, id]
    );
    res.json({ message: 'Proyecto actualizado' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Eliminar un proyecto
router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query('DELETE FROM projects WHERE id = ?', [id]);
    res.json({ message: 'Proyecto eliminado' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Obtener información de creación de un proyecto  --------------------------    CORREGIR PORQUE DA ERROR  
router.get('/project/:id/creation-info', async (req, res) => {
  const { id } = req.params;
  try {
    const [results] = await pool.query(
      'SELECT projects.created_at, users.name AS created_by FROM projects JOIN users ON projects.created_by = users.id WHERE projects.id = ?',
      [id]
    );
    if (results.length === 0) return res.status(404).json({ error: 'Información de creación no encontrada' });
    res.json(results[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Obtener estadísticas de proyectos          --------------------------    CORREGIR PORQUE DA ERROR 
router.get('/stats', async (req, res) => {
  try {
    const [results] = await pool.query(
      'SELECT users.id AS userId, users.name AS userName, COUNT(projects.id) AS totalProjects FROM users LEFT JOIN projects ON users.id = projects.created_by GROUP BY users.id'
    );
    res.json(results);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
