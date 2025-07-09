// backend/routes/projects.js
const express = require('express');
const router = express.Router();
const pool = require('../db/db');

// ---------------------------
// OBTENER TODOS LOS PROYECTOS DE UN USUARIO
// ---------------------------
router.get('/user/:userId', async (req, res) => {
  const { userId } = req.params;
  try {
    const [results] = await pool.query(
      `SELECT 
         p.id,
         p.name,
         p.color,
         p.description,
         p.created_by      AS createdBy,
         p.created_at      AS createdAt,
         u.name            AS creatorName
       FROM projects p
       JOIN users u ON u.id = p.created_by
       WHERE p.created_by = ?`,
      [userId]
    );
    res.json(results);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ---------------------------
// CREAR NUEVO PROYECTO
// ---------------------------
router.post('/', async (req, res) => {
  const { name, color, description = '', created_by } = req.body;
  const created_at = Date.now();

  try {
    // Verifico que el usuario exista
    const [userResult] = await pool.query(
      'SELECT 1 FROM users WHERE id = ?', 
      [created_by]
    );
    if (userResult.length === 0) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    const [result] = await pool.query(
      `INSERT INTO projects 
         (name, color, description, created_by, created_at) 
       VALUES (?, ?, ?, ?, ?)`,
      [name, color, description, created_by, created_at]
    );

    res.status(201).json({ id: result.insertId });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ---------------------------
// ACTUALIZAR UN PROYECTO
// ---------------------------
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { name, color, description } = req.body;
  try {
    await pool.query(
      `UPDATE projects 
         SET name = ?, color = ?, description = ?
       WHERE id = ?`,
      [name, color, description, id]
    );
    res.json({ message: 'Proyecto actualizado' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ---------------------------
// ELIMINAR UN PROYECTO
// ---------------------------
router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query(
      'DELETE FROM projects WHERE id = ?', 
      [id]
    );
    res.json({ message: 'Proyecto eliminado' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ---------------------------
// OBTENER INFO DE CREACIÓN DE UN PROYECTO
// ---------------------------
router.get('/:id/creation-info', async (req, res) => {
  const { id } = req.params;
  if (isNaN(id)) {
    return res.status(400).json({ error: 'El ID del proyecto debe ser un número válido' });
  }
  try {
    const [results] = await pool.query(
      `SELECT 
         p.created_at     AS createdAt,
         u.name           AS createdBy
       FROM projects p
       JOIN users u ON u.id = p.created_by
       WHERE p.id = ?`,
      [id]
    );
    if (results.length === 0) {
      return res.status(404).json({ error: 'Información de creación no encontrada' });
    }
    res.json(results[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ---------------------------
// OBTENER PROYECTO POR ID
// ---------------------------
router.get('/:id', async (req, res) => {
  const { id } = req.params;
  if (isNaN(id)) {
    return res.status(400).json({ error: 'El ID del proyecto debe ser un número válido' });
  }
  try {
    const [results] = await pool.query(
      'SELECT * FROM projects WHERE id = ?', 
      [id]
    );
    if (results.length === 0) {
      return res.status(404).json({ error: 'Proyecto no encontrado' });
    }
    res.json(results[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
