const express = require('express');
const router = express.Router();
const pool = require('../db/db');

// 📥 Crear una nueva nota
router.post('/notes', async (req, res) => {
  const { title, section_id, user_id } = req.body;
  const created_at = Date.now();

  if (!title || !section_id || !user_id) {
    return res.status(400).json({ error: 'Faltan datos obligatorios' });
  }

  try {
    const [result] = await pool.execute(
      'INSERT INTO notes (title, section_id, user_id, created_at) VALUES (?, ?, ?, ?)',
      [title, section_id, user_id, created_at]
    );
    res.status(201).json({ message: 'Nota creada', noteId: result.insertId });
  } catch (error) {
    res.status(500).json({ error: 'Error al crear la nota' });
  }
});

// 📄 Obtener todas las notas de una sección
router.get('/notes/:sectionId', async (req, res) => {
  const { sectionId } = req.params;

  try {
    const [notes] = await pool.execute(
      'SELECT * FROM notes WHERE section_id = ? ORDER BY created_at DESC',
      [sectionId]
    );
    res.json(notes);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener las notas' });
  }
});

// 📝 Editar el título de una nota
router.put('/notes/:id', async (req, res) => {
  const { title } = req.body;
  const { id } = req.params;
  const updated_at = Date.now();

  try {
    await pool.execute(
      'UPDATE notes SET title = ?, updated_at = ? WHERE id = ?',
      [title, updated_at, id]
    );
    res.json({ message: 'Nota actualizada' });
  } catch (error) {
    res.status(500).json({ error: 'Error al actualizar la nota' });
  }
});

// 🗑️ Eliminar una nota (y sus todos)
router.delete('/notes/:id', async (req, res) => {
  const { id } = req.params;

  try {
    await pool.execute('DELETE FROM notes WHERE id = ?', [id]);
    res.json({ message: 'Nota eliminada', deletedId: id });
  } catch (error) {
    res.status(500).json({ error: 'Error al eliminar la nota' });
  }
});

// ➕ Añadir un ToDo a una nota (máx. 8)
router.post('/notes/:noteId/todos', async (req, res) => {
  const { content } = req.body;
  const { noteId } = req.params;

  if (!content) {
    return res.status(400).json({ error: 'El contenido es obligatorio' });
  }

  try {
    const [todos] = await pool.execute(
      'SELECT COUNT(*) as total FROM note_todos WHERE note_id = ?',
      [noteId]
    );

    if (todos[0].total >= 8) {
      return res.status(400).json({ error: 'Máximo 8 ToDos por nota' });
    }

    await pool.execute(
      'INSERT INTO note_todos (note_id, content, position) VALUES (?, ?, ?)',
      [noteId, content, todos[0].total]
    );

    res.status(201).json({ message: 'ToDo añadido' });
  } catch (error) {
    res.status(500).json({ error: 'Error al añadir ToDo' });
  }
});

// 📃 Obtener todos los ToDos de una nota
router.get('/notes/:noteId/todos', async (req, res) => {
  const { noteId } = req.params;

  try {
    const [todos] = await pool.execute(
      'SELECT * FROM note_todos WHERE note_id = ? ORDER BY position',
      [noteId]
    );
    res.json(todos);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener los ToDos' });
  }
});

// ✔️ Marcar ToDo como completado o editar
router.put('/todos/:id', async (req, res) => {
  const { content, is_completed } = req.body;
  const { id } = req.params;

  try {
    await pool.execute(
      'UPDATE note_todos SET content = ?, is_completed = ? WHERE id = ?',
      [content, is_completed, id]
    );
    res.json({ message: 'ToDo actualizado' });
  } catch (error) {
    res.status(500).json({ error: 'Error al actualizar ToDo' });
  }
});

// 🗑️ Eliminar un ToDo
router.delete('/todos/:id', async (req, res) => {
  const { id } = req.params;

  try {
    await pool.execute('DELETE FROM note_todos WHERE id = ?', [id]);
    res.json({ message: 'ToDo eliminado', deletedId: id });
  } catch (error) {
    res.status(500).json({ error: 'Error al eliminar ToDo' });
  }
});

// 🔀 Reordenar ToDos de una nota
router.put('/notes/:noteId/todos/reorder', async (req, res) => {
  const { noteId } = req.params;
  const { todoIds } = req.body;

  if (!Array.isArray(todoIds)) {
    return res.status(400).json({ error: 'Formato de orden incorrecto' });
  }

  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    for (let position = 0; position < todoIds.length; position++) {
      await connection.execute(
        'UPDATE note_todos SET position = ? WHERE id = ? AND note_id = ?',
        [position, todoIds[position], noteId]
      );
    }

    await connection.commit();
    res.json({ message: 'ToDos reordenados' });
  } catch (error) {
    await connection.rollback();
    res.status(500).json({ error: 'Error al reordenar ToDos' });
  } finally {
    connection.release();
  }
});

module.exports = router;
