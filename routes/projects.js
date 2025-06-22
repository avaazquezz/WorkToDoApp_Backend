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
      'SELECT * FROM projects WHERE created_by = ?',
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
  const { name, color, created_by } = req.body;
  const created_at = Date.now();

  try {
    // Buscar el correo electrónico del usuario en la base de datos
    const [userResult] = await pool.query('SELECT email FROM users WHERE id = ?', [created_by]);
    if (userResult.length === 0) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    const userEmail = userResult[0].email;

    // Insertar el proyecto con el correo electrónico del usuario
    const [result] = await pool.query(
      'INSERT INTO projects (name, color, created_by, created_at) VALUES (?, ?, ?, ?)',
      [name, color, userEmail, created_at]
    );

    res.status(201).json({ id: result.insertId, message: 'Proyecto creado exitosamente' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ---------------------------
// ACTUALIZAR UN PROYECTO
// ---------------------------
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

// ---------------------------
// ELIMINAR UN PROYECTO
// ---------------------------
router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query('DELETE FROM projects WHERE id = ?', [id]);
    res.json({ message: 'Proyecto eliminado' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ---------------------------
// OBTENER INFO DE CREACIÓN DE UN PROYECTO
// Usuario que ha creado el proyecto y fecha de creación
// ---------------------------
router.get('/:id/creation-info', async (req, res) => {
  const { id } = req.params;
  try {
    if (isNaN(id)) {
      return res.status(400).json({ error: 'El ID del proyecto debe ser un número válido' });
    }

    const [results] = await pool.query(
      `SELECT projects.created_at, users.name AS created_by
         FROM projects
   INNER JOIN users ON projects.created_by = users.id
        WHERE projects.id = ?`,
      [id]
    );

    if (!results || results.length === 0) {
      return res.status(404).json({ error: 'Información de creación no encontrada' });
    }

    res.json(results[0]);
  } catch (err) {
    res.status(500).json({ error: 'Error interno del servidor', details: err.message });
  }
});

// ---------------------------
// OBTENER PROYECTO POR ID
// ---------------------------
router.get('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    if (isNaN(id)) {
      return res.status(400).json({ error: 'El ID del proyecto debe ser un número válido' });
    }

    const [results] = await pool.query(
      'SELECT * FROM projects WHERE id = ?',
      [id]
    );

    if (results.length === 0) {
      return res.status(404).json({ error: 'Proyecto no encontrado' });
    }

    res.json(results[0]);
  } catch (err) {
    res.status(500).json({ error: 'Error interno del servidor', details: err.message });
  }
});

module.exports = router;
