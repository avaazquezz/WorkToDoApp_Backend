// Integration tests for projects routes
const request = require('supertest');
const express = require('express');
const mysql = require('mysql2/promise');
const projectRoutes = require('../../routes/projects');
const { cleanTestDb, testDbConfig } = require('../helpers/testDb');
const { createTestUser, validProjectData } = require('../helpers/fixtures');

// Create test app
const createTestApp = () => {
  const app = express();
  app.use(express.json());
  app.use('/api/projects', projectRoutes);
  return app;
};

describe('Projects Routes Integration Tests', () => {
  let app;
  let testPool;
  let testUserId;

  beforeAll(async () => {
    app = createTestApp();
    testPool = mysql.createPool(testDbConfig);
  });

  beforeEach(async () => {
    await cleanTestDb(testPool);
    
    // Create a test user
    const testUser = await createTestUser();
    const [result] = await testPool.query(
      'INSERT INTO users (name, email, password) VALUES (?, ?, ?)',
      [testUser.name, testUser.email, testUser.password]
    );
    testUserId = result.insertId;
  });

  afterAll(async () => {
    if (testPool) {
      await testPool.end();
    }
  });

  describe('POST /api/projects', () => {
    it('should create a new project successfully', async () => {
      const projectData = {
        ...validProjectData,
        created_by: testUserId
      };

      const response = await request(app)
        .post('/api/projects')
        .send(projectData)
        .expect(201);

      expect(response.body).toHaveProperty('id');
      expect(typeof response.body.id).toBe('number');

      // Verify project was created in database
      const [projects] = await testPool.query(
        'SELECT * FROM projects WHERE id = ?',
        [response.body.id]
      );

      expect(projects).toHaveLength(1);
      expect(projects[0]).toMatchObject({
        name: projectData.name,
        color: projectData.color,
        description: projectData.description,
        created_by: testUserId
      });
    });

    it('should return 404 for non-existent user', async () => {
      const projectData = {
        ...validProjectData,
        created_by: 99999 // Non-existent user
      };

      const response = await request(app)
        .post('/api/projects')
        .send(projectData)
        .expect(404);

      expect(response.body).toHaveProperty('error', 'Usuario no encontrado');
    });

    it('should handle missing required fields', async () => {
      const invalidProjectData = {
        color: validProjectData.color,
        // missing name and created_by
      };

      await request(app)
        .post('/api/projects')
        .send(invalidProjectData)
        .expect(500); // Database constraint error
    });
  });

  describe('GET /api/projects/user/:userId', () => {
    it('should return user projects successfully', async () => {
      // Create multiple projects for user
      const project1 = { ...validProjectData, name: 'Project 1', created_by: testUserId };
      const project2 = { ...validProjectData, name: 'Project 2', created_by: testUserId };

      await testPool.query(
        'INSERT INTO projects (name, color, description, created_by, created_at) VALUES (?, ?, ?, ?, ?)',
        [project1.name, project1.color, project1.description, project1.created_by, project1.created_at]
      );

      await testPool.query(
        'INSERT INTO projects (name, color, description, created_by, created_at) VALUES (?, ?, ?, ?, ?)',
        [project2.name, project2.color, project2.description, project2.created_by, project2.created_at]
      );

      const response = await request(app)
        .get(`/api/projects/user/${testUserId}`)
        .expect(200);

      expect(response.body).toHaveLength(2);
      expect(response.body[0]).toHaveProperty('id');
      expect(response.body[0]).toHaveProperty('name');
      expect(response.body[0]).toHaveProperty('color');
      expect(response.body[0]).toHaveProperty('description');
      expect(response.body[0]).toHaveProperty('createdBy', testUserId);
      expect(response.body[0]).toHaveProperty('creatorName');
    });

    it('should return empty array for user with no projects', async () => {
      const response = await request(app)
        .get(`/api/projects/user/${testUserId}`)
        .expect(200);

      expect(response.body).toHaveLength(0);
      expect(Array.isArray(response.body)).toBe(true);
    });
  });

  describe('GET /api/projects/:id', () => {
    it('should return project by id successfully', async () => {
      // Create a project
      const [result] = await testPool.query(
        'INSERT INTO projects (name, color, description, created_by, created_at) VALUES (?, ?, ?, ?, ?)',
        [validProjectData.name, validProjectData.color, validProjectData.description, testUserId, Date.now()]
      );
      const projectId = result.insertId;

      const response = await request(app)
        .get(`/api/projects/${projectId}`)
        .expect(200);

      expect(response.body).toHaveProperty('id', projectId);
      expect(response.body).toHaveProperty('name', validProjectData.name);
      expect(response.body).toHaveProperty('color', validProjectData.color);
      expect(response.body).toHaveProperty('description', validProjectData.description);
    });

    it('should return 404 for non-existent project', async () => {
      const response = await request(app)
        .get('/api/projects/99999')
        .expect(404);

      expect(response.body).toHaveProperty('error', 'Proyecto no encontrado');
    });

    it('should return 400 for invalid project id', async () => {
      const response = await request(app)
        .get('/api/projects/invalid-id')
        .expect(400);

      expect(response.body).toHaveProperty('error', 'El ID del proyecto debe ser un número válido');
    });
  });

  describe('PUT /api/projects/:id', () => {
    it('should update project successfully', async () => {
      // Create a project
      const [result] = await testPool.query(
        'INSERT INTO projects (name, color, description, created_by, created_at) VALUES (?, ?, ?, ?, ?)',
        [validProjectData.name, validProjectData.color, validProjectData.description, testUserId, Date.now()]
      );
      const projectId = result.insertId;

      const updateData = {
        name: 'Updated Project Name',
        color: '#000000',
        description: 'Updated description'
      };

      const response = await request(app)
        .put(`/api/projects/${projectId}`)
        .send(updateData)
        .expect(200);

      expect(response.body).toHaveProperty('message', 'Proyecto actualizado');

      // Verify update in database
      const [projects] = await testPool.query(
        'SELECT * FROM projects WHERE id = ?',
        [projectId]
      );

      expect(projects[0]).toMatchObject(updateData);
    });
  });

  describe('DELETE /api/projects/:id', () => {
    it('should delete project successfully', async () => {
      // Create a project
      const [result] = await testPool.query(
        'INSERT INTO projects (name, color, description, created_by, created_at) VALUES (?, ?, ?, ?, ?)',
        [validProjectData.name, validProjectData.color, validProjectData.description, testUserId, Date.now()]
      );
      const projectId = result.insertId;

      const response = await request(app)
        .delete(`/api/projects/${projectId}`)
        .expect(200);

      expect(response.body).toHaveProperty('message', 'Proyecto eliminado');

      // Verify deletion in database
      const [projects] = await testPool.query(
        'SELECT * FROM projects WHERE id = ?',
        [projectId]
      );

      expect(projects).toHaveLength(0);
    });
  });

  describe('GET /api/projects/:id/creation-info', () => {
    it('should return creation info successfully', async () => {
      // Create a project
      const createdAt = Date.now();
      const [result] = await testPool.query(
        'INSERT INTO projects (name, color, description, created_by, created_at) VALUES (?, ?, ?, ?, ?)',
        [validProjectData.name, validProjectData.color, validProjectData.description, testUserId, createdAt]
      );
      const projectId = result.insertId;

      const response = await request(app)
        .get(`/api/projects/${projectId}/creation-info`)
        .expect(200);

      expect(response.body).toHaveProperty('createdAt', createdAt);
      expect(response.body).toHaveProperty('createdBy');
    });

    it('should return 404 for non-existent project', async () => {
      const response = await request(app)
        .get('/api/projects/99999/creation-info')
        .expect(404);

      expect(response.body).toHaveProperty('error', 'Información de creación no encontrada');
    });
  });
});
