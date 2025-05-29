const express = require('express');
const router = express.Router();
const sql = require('../db/db');

// Obtener todos los proyectos de un usuario
router.get('/:userId', async (req, res) => {
  const { userId } = req.params;
  try {
    const results = await sql`SELECT * FROM projects WHERE created_by = ${userId}`;
    res.json(results);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Obtener un proyecto por ID
router.get('/project/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const results = await sql`SELECT * FROM projects WHERE id = ${id}`;
    if (results.length === 0) return res.status(404).json({ error: 'Proyecto no encontrado' });
    res.json(results[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Crear nuevo proyecto
router.post('/', async (req, res) => {
  const { name, color, created_by } = req.body;
  const created_at = new Date(); // Generar la fecha actual automáticamente
  try {
    const [result] = await sql`
      INSERT INTO projects (name, color, created_by, created_at)
      VALUES (${name}, ${color}, ${created_by}, ${created_at})
      RETURNING id
    `;
    res.status(201).json({ id: result.id, message: 'Proyecto creado exitosamente' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Actualizar un proyecto
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { name, color } = req.body;
  try {
    await sql`
      UPDATE projects
      SET name = ${name}, color = ${color}
      WHERE id = ${id}
    `;
    res.json({ message: 'Proyecto actualizado' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Eliminar un proyecto
router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await sql`DELETE FROM projects WHERE id = ${id}`;
    res.json({ message: 'Proyecto eliminado' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Obtener información de creación de un proyecto
router.get('/project/:id/creation-info', async (req, res) => {
  const { id } = req.params;
  try {
    const results = await sql`
      SELECT projects.created_at, users.name AS created_by
      FROM projects
      JOIN users ON projects.created_by = users.id
      WHERE projects.id = ${id}
    `;
    if (results.length === 0) return res.status(404).json({ error: 'Información de creación no encontrada' });
    res.json(results[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Obtener estadísticas de proyectos
router.get('/stats', async (req, res) => {
  try {
    const results = await sql`
      SELECT users.id AS userId, users.name AS userName, COUNT(projects.id) AS totalProjects
      FROM users
      LEFT JOIN projects ON users.id = projects.created_by
      GROUP BY users.id
    `;
    res.json(results);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
