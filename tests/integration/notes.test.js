// Integration tests for notes/todos routes
const request = require('supertest');
const express = require('express');
const mysql = require('mysql2/promise');
const notesRoutes = require('../../routes/ToDo');
const { cleanTestDb, testDbConfig, closePool } = require('../helpers/testDb');
const { createTestUser, createTestProject, createTestSection, createTestNote } = require('../helpers/fixtures');

// Create test app
const createTestApp = () => {
  const app = express();
  app.use(express.json());
  app.use('/api/notes', notesRoutes);
  return app;
};

describe('Notes/ToDos Routes Integration Tests', () => {
  let app;
  let testPool;
  let testUserId;
  let testProjectId;
  let testSectionId;

  beforeAll(async () => {
    app = createTestApp();
    testPool = mysql.createPool(testDbConfig);
  });

  beforeEach(async () => {
    await cleanTestDb(testPool);
    
    // Create test user
    const testUser = await createTestUser();
    const [userResult] = await testPool.query(
      'INSERT INTO users (name, email, password) VALUES (?, ?, ?)',
      [testUser.name, testUser.email, testUser.password]
    );
    testUserId = userResult.insertId;

    // Create test project
    const testProject = createTestProject(testUserId);
    const [projectResult] = await testPool.query(
      'INSERT INTO projects (name, color, description, created_by, created_at) VALUES (?, ?, ?, ?, ?)',
      [testProject.name, testProject.color, testProject.description, testProject.created_by, testProject.created_at]
    );
    testProjectId = projectResult.insertId;

    // Create test section
    const testSection = createTestSection(testProjectId, testUserId);
    const [sectionResult] = await testPool.query(
      'INSERT INTO sections (title, description, color, createdAt, project_id, user_id) VALUES (?, ?, ?, ?, ?, ?)',
      [testSection.title, testSection.description, testSection.color, testSection.createdAt, testSection.project_id, testSection.user_id]
    );
    testSectionId = sectionResult.insertId;
  });

  afterAll(async () => {
    if (testPool) {
      await closePool(testPool);
    }
  });

  describe('POST /api/notes/new', () => {
    it('should create a new note successfully', async () => {
      const noteData = {
        title: 'Test Note',
        section_id: testSectionId,
        user_id: testUserId
      };

      const response = await request(app)
        .post('/api/notes/new')
        .send(noteData)
        .expect(201);

      expect(response.body).toHaveProperty('message', 'Nota creada');
      expect(response.body).toHaveProperty('noteId');
      expect(typeof response.body.noteId).toBe('number');

      // Verify note was created in database
      const [notes] = await testPool.query(
        'SELECT * FROM notes WHERE id = ?',
        [response.body.noteId]
      );

      expect(notes).toHaveLength(1);
      expect(notes[0]).toMatchObject({
        title: noteData.title,
        section_id: noteData.section_id,
        user_id: noteData.user_id
      });
    });

    it('should return 400 for missing required fields', async () => {
      const invalidNoteData = {
        title: 'Test Note'
        // missing section_id and user_id
      };

      const response = await request(app)
        .post('/api/notes/new')
        .send(invalidNoteData)
        .expect(400);

      expect(response.body).toHaveProperty('error', 'Faltan datos obligatorios');
    });
  });

  describe('GET /api/notes/section/:sectionId', () => {
    it('should return notes for a section', async () => {
      // Create multiple notes
      const note1Data = createTestNote(testSectionId, testUserId);
      const note2Data = { ...createTestNote(testSectionId, testUserId), title: 'Second Note' };

      await testPool.query(
        'INSERT INTO notes (title, section_id, user_id, created_at) VALUES (?, ?, ?, ?)',
        [note1Data.title, note1Data.section_id, note1Data.user_id, note1Data.created_at]
      );

      await testPool.query(
        'INSERT INTO notes (title, section_id, user_id, created_at) VALUES (?, ?, ?, ?)',
        [note2Data.title, note2Data.section_id, note2Data.user_id, note2Data.created_at]
      );

      const response = await request(app)
        .get(`/api/notes/section/${testSectionId}`)
        .expect(200);

      expect(response.body).toHaveLength(2);
      expect(response.body[0]).toHaveProperty('id');
      expect(response.body[0]).toHaveProperty('title');
      expect(response.body[0]).toHaveProperty('section_id', testSectionId);
    });

    it('should return empty array for section with no notes', async () => {
      const response = await request(app)
        .get(`/api/notes/section/${testSectionId}`)
        .expect(200);

      expect(response.body).toHaveLength(0);
      expect(Array.isArray(response.body)).toBe(true);
    });
  });

  describe('PUT /api/notes/:id', () => {
    it('should update note title successfully', async () => {
      // Create a note
      const noteData = createTestNote(testSectionId, testUserId);
      const [result] = await testPool.query(
        'INSERT INTO notes (title, section_id, user_id, created_at) VALUES (?, ?, ?, ?)',
        [noteData.title, noteData.section_id, noteData.user_id, noteData.created_at]
      );
      const noteId = result.insertId;

      const updateData = {
        title: 'Updated Note Title'
      };

      const response = await request(app)
        .put(`/api/notes/${noteId}`)
        .send(updateData)
        .expect(200);

      expect(response.body).toHaveProperty('message', 'Nota actualizada');

      // Verify update in database
      const [notes] = await testPool.query(
        'SELECT * FROM notes WHERE id = ?',
        [noteId]
      );

      expect(notes[0].title).toBe(updateData.title);
      expect(notes[0].updated_at).toBeDefined();
    });
  });

  describe('DELETE /api/notes/:id', () => {
    it('should delete note successfully', async () => {
      // Create a note
      const noteData = createTestNote(testSectionId, testUserId);
      const [result] = await testPool.query(
        'INSERT INTO notes (title, section_id, user_id, created_at) VALUES (?, ?, ?, ?)',
        [noteData.title, noteData.section_id, noteData.user_id, noteData.created_at]
      );
      const noteId = result.insertId;

      const response = await request(app)
        .delete(`/api/notes/${noteId}`)
        .expect(200);

      expect(response.body).toHaveProperty('message', 'Nota eliminada');
      expect(response.body).toHaveProperty('deletedId', noteId.toString());

      // Verify deletion in database
      const [notes] = await testPool.query(
        'SELECT * FROM notes WHERE id = ?',
        [noteId]
      );

      expect(notes).toHaveLength(0);
    });
  });

  describe('ToDo operations', () => {
    let noteId;

    beforeEach(async () => {
      // Create a note for todo tests
      const noteData = createTestNote(testSectionId, testUserId);
      const [result] = await testPool.query(
        'INSERT INTO notes (title, section_id, user_id, created_at) VALUES (?, ?, ?, ?)',
        [noteData.title, noteData.section_id, noteData.user_id, noteData.created_at]
      );
      noteId = result.insertId;
    });

    describe('POST /api/notes/:noteId/todos', () => {
      it('should add todo to note successfully', async () => {
        const todoData = {
          content: 'Test todo content'
        };

        const response = await request(app)
          .post(`/api/notes/${noteId}/todos`)
          .send(todoData)
          .expect(201);

        expect(response.body).toHaveProperty('message', 'ToDo añadido');

        // Verify todo was created in database
        const [todos] = await testPool.query(
          'SELECT * FROM note_todos WHERE note_id = ?',
          [noteId]
        );

        expect(todos).toHaveLength(1);
        expect(todos[0]).toMatchObject({
          note_id: noteId,
          content: todoData.content,
          is_completed: 0,
          position: 0
        });
      });

      it('should return 400 for missing content', async () => {
        const response = await request(app)
          .post(`/api/notes/${noteId}/todos`)
          .send({})
          .expect(400);

        expect(response.body).toHaveProperty('error', 'El contenido es obligatorio');
      });

      it('should enforce maximum 8 todos per note', async () => {
        // Add 8 todos
        for (let i = 0; i < 8; i++) {
          await testPool.query(
            'INSERT INTO note_todos (note_id, content, position) VALUES (?, ?, ?)',
            [noteId, `Todo ${i + 1}`, i]
          );
        }

        const response = await request(app)
          .post(`/api/notes/${noteId}/todos`)
          .send({ content: 'Ninth todo' })
          .expect(400);

        expect(response.body).toHaveProperty('error', 'Máximo 8 ToDos por nota');
      });
    });

    describe('GET /api/notes/:noteId/todos', () => {
      it('should return todos for a note', async () => {
        // Add multiple todos
        await testPool.query(
          'INSERT INTO note_todos (note_id, content, position) VALUES (?, ?, ?)',
          [noteId, 'First todo', 0]
        );
        await testPool.query(
          'INSERT INTO note_todos (note_id, content, position) VALUES (?, ?, ?)',
          [noteId, 'Second todo', 1]
        );

        const response = await request(app)
          .get(`/api/notes/${noteId}/todos`)
          .expect(200);

        expect(response.body).toHaveLength(2);
        expect(response.body[0]).toHaveProperty('content', 'First todo');
        expect(response.body[0]).toHaveProperty('position', 0);
        expect(response.body[1]).toHaveProperty('content', 'Second todo');
        expect(response.body[1]).toHaveProperty('position', 1);
      });
    });

    describe('PUT /api/notes/todos/:id', () => {
      it('should update todo successfully', async () => {
        // Create a todo
        const [result] = await testPool.query(
          'INSERT INTO note_todos (note_id, content, position) VALUES (?, ?, ?)',
          [noteId, 'Original content', 0]
        );
        const todoId = result.insertId;

        const updateData = {
          content: 'Updated content',
          is_completed: true
        };

        const response = await request(app)
          .put(`/api/notes/todos/${todoId}`)
          .send(updateData)
          .expect(200);

        expect(response.body).toHaveProperty('message', 'ToDo actualizado');

        // Verify update in database
        const [todos] = await testPool.query(
          'SELECT * FROM note_todos WHERE id = ?',
          [todoId]
        );

        expect(todos[0].content).toBe(updateData.content);
        expect(todos[0].is_completed).toBe(1); // MySQL stores boolean as tinyint
      });
    });

    describe('DELETE /api/notes/todos/:id', () => {
      it('should delete todo successfully', async () => {
        // Create a todo
        const [result] = await testPool.query(
          'INSERT INTO note_todos (note_id, content, position) VALUES (?, ?, ?)',
          [noteId, 'Todo to delete', 0]
        );
        const todoId = result.insertId;

        const response = await request(app)
          .delete(`/api/notes/todos/${todoId}`)
          .expect(200);

        expect(response.body).toHaveProperty('message', 'ToDo eliminado');
        expect(response.body).toHaveProperty('deletedId', todoId.toString());

        // Verify deletion in database
        const [todos] = await testPool.query(
          'SELECT * FROM note_todos WHERE id = ?',
          [todoId]
        );

        expect(todos).toHaveLength(0);
      });
    });

    describe('PUT /api/notes/:noteId/todos/reorder', () => {
      it('should reorder todos successfully', async () => {
        // Create multiple todos
        const [result1] = await testPool.query(
          'INSERT INTO note_todos (note_id, content, position) VALUES (?, ?, ?)',
          [noteId, 'First todo', 0]
        );
        const [result2] = await testPool.query(
          'INSERT INTO note_todos (note_id, content, position) VALUES (?, ?, ?)',
          [noteId, 'Second todo', 1]
        );
        const [result3] = await testPool.query(
          'INSERT INTO note_todos (note_id, content, position) VALUES (?, ?, ?)',
          [noteId, 'Third todo', 2]
        );

        const todoIds = [result3.insertId, result1.insertId, result2.insertId]; // Reorder

        const response = await request(app)
          .put(`/api/notes/${noteId}/todos/reorder`)
          .send({ todoIds })
          .expect(200);

        expect(response.body).toHaveProperty('message', 'ToDos reordenados');

        // Verify reorder in database
        const [todos] = await testPool.query(
          'SELECT * FROM note_todos WHERE note_id = ? ORDER BY position',
          [noteId]
        );

        expect(todos[0].id).toBe(result3.insertId);
        expect(todos[0].position).toBe(0);
        expect(todos[1].id).toBe(result1.insertId);
        expect(todos[1].position).toBe(1);
        expect(todos[2].id).toBe(result2.insertId);
        expect(todos[2].position).toBe(2);
      });

      it('should return 400 for invalid todoIds format', async () => {
        const response = await request(app)
          .put(`/api/notes/${noteId}/todos/reorder`)
          .send({ todoIds: 'not-an-array' })
          .expect(400);

        expect(response.body).toHaveProperty('error', 'Formato de orden incorrecto');
      });
    });
  });
});
