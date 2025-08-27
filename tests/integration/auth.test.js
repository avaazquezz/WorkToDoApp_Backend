// Integration tests for auth routes
const request = require('supertest');
const express = require('express');
const mysql = require('mysql2/promise');
const authRoutes = require('../../routes/auth');
const { cleanTestDb, testDbConfig, closePool } = require('../helpers/testDb');
const { validUserData } = require('../helpers/fixtures');

// Create test app
const createTestApp = () => {
  const app = express();
  app.use(express.json());
  app.use('/api/auth', authRoutes);
  return app;
};

describe('Auth Routes Integration Tests', () => {
  let app;
  let testPool;

  beforeAll(async () => {
    app = createTestApp();
    testPool = mysql.createPool(testDbConfig);
  });

  beforeEach(async () => {
    await cleanTestDb(testPool);
  });

  afterAll(async () => {
    if (testPool) {
      await closePool(testPool);
    }
  });

  describe('POST /api/auth/register', () => {
    it('should register a new user successfully', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send(validUserData)
        .expect(201);

      expect(response.body).toHaveProperty('message', 'Usuario registrado');
      expect(response.body).toHaveProperty('token');
      expect(response.body).toHaveProperty('user');
      expect(response.body.user).toHaveProperty('id');
      expect(response.body.user).toHaveProperty('name', validUserData.name);
      expect(response.body.user).toHaveProperty('email', validUserData.email);
      expect(response.body.user).not.toHaveProperty('password');
    });

    it('should return 400 for missing required fields', async () => {
      const invalidData = {
        name: validUserData.name,
        // missing email and password
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(invalidData)
        .expect(400);

      expect(response.body).toHaveProperty('error', 'Todos los campos son obligatorios');
    });

    it('should return 409 for duplicate email', async () => {
      // Register user first time
      await request(app)
        .post('/api/auth/register')
        .send(validUserData)
        .expect(201);

      // Try to register with same email
      const response = await request(app)
        .post('/api/auth/register')
        .send(validUserData)
        .expect(409);

      expect(response.body).toHaveProperty('error', 'El correo electrónico ya está registrado');
    });

    it('should hash the password before storing', async () => {
      await request(app)
        .post('/api/auth/register')
        .send(validUserData)
        .expect(201);

      // Check that password is hashed in database
      const [users] = await testPool.query(
        'SELECT password FROM users WHERE email = ?',
        [validUserData.email]
      );

      expect(users[0].password).not.toBe(validUserData.password);
      expect(users[0].password).toMatch(/^\$2[aby]?\$\d+\$/); // bcrypt hash pattern
    });
  });

  describe('POST /api/auth/login', () => {
    beforeEach(async () => {
      // Register a user before each login test
      await request(app)
        .post('/api/auth/register')
        .send(validUserData)
        .expect(201);
    });

    it('should login user successfully', async () => {
      const loginData = {
        email: validUserData.email,
        password: validUserData.password
      };

      const response = await request(app)
        .post('/api/auth/login')
        .send(loginData)
        .expect(200);

      expect(response.body).toHaveProperty('message', 'Login OK');
      expect(response.body).toHaveProperty('token');
      expect(response.body).toHaveProperty('user');
      expect(response.body.user).toHaveProperty('id');
      expect(response.body.user).toHaveProperty('name', validUserData.name);
      expect(response.body.user).toHaveProperty('email', validUserData.email);
      expect(response.body.user).toHaveProperty('is_premium');
      expect(response.body.user).not.toHaveProperty('password');
    });

    it('should return 401 for non-existent user', async () => {
      const loginData = {
        email: 'nonexistent@example.com',
        password: 'password123'
      };

      const response = await request(app)
        .post('/api/auth/login')
        .send(loginData)
        .expect(401);

      expect(response.body).toHaveProperty('error', 'Usuario no encontrado');
    });

    it('should return 401 for incorrect password', async () => {
      const loginData = {
        email: validUserData.email,
        password: 'wrongpassword'
      };

      const response = await request(app)
        .post('/api/auth/login')
        .send(loginData)
        .expect(401);

      expect(response.body).toHaveProperty('error', 'Contraseña incorrecta');
    });

    it('should return valid JWT token', async () => {
      const jwt = require('jsonwebtoken');
      const loginData = {
        email: validUserData.email,
        password: validUserData.password
      };

      const response = await request(app)
        .post('/api/auth/login')
        .send(loginData)
        .expect(200);

      const token = response.body.token;
      expect(token).toBeDefined();

      // Verify token is valid
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      expect(decoded).toHaveProperty('id');
      expect(decoded).toHaveProperty('email', validUserData.email);
      expect(decoded).toHaveProperty('exp');
    });
  });
});
