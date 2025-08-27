// Unit tests for auth controller
const jwt = require('jsonwebtoken');
const { register, login } = require('../../controllers/authController');
const { hashPassword } = require('../../utils/hash');
const { cleanTestDb } = require('../helpers/testDb');
const { validUserData } = require('../helpers/fixtures');

// Mock the database pool
jest.mock('../../db/db', () => ({
  query: jest.fn()
}));

const mockPool = require('../../db/db');

describe('Auth Controller', () => {
  let req, res;

  beforeEach(() => {
    req = {
      body: {}
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis()
    };
    jest.clearAllMocks();
  });

  describe('register', () => {
    it('should register a new user successfully', async () => {
      const userData = { ...validUserData };
      req.body = userData;

      const insertResult = [{ insertId: 1 }];
      mockPool.query.mockResolvedValueOnce(insertResult);

      await register(req, res);

      expect(mockPool.query).toHaveBeenCalledWith(
        'INSERT INTO users (name, email, password) VALUES (?, ?, ?)',
        expect.arrayContaining([userData.name, userData.email, expect.any(String)])
      );
      
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Usuario registrado',
        token: expect.any(String),
        user: {
          id: 1,
          name: userData.name,
          email: userData.email
        }
      });
    });

    it('should return 400 for missing fields', async () => {
      req.body = { name: 'Test User' }; // Missing email and password

      await register(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        error: 'Todos los campos son obligatorios'
      });
      expect(mockPool.query).not.toHaveBeenCalled();
    });

    it('should return 409 for duplicate email', async () => {
      const userData = { ...validUserData };
      req.body = userData;

      const error = new Error('Duplicate entry');
      error.code = 'ER_DUP_ENTRY';
      mockPool.query.mockRejectedValueOnce(error);

      await register(req, res);

      expect(res.status).toHaveBeenCalledWith(409);
      expect(res.json).toHaveBeenCalledWith({
        error: 'El correo electrónico ya está registrado'
      });
    });

    it('should return 500 for database errors', async () => {
      const userData = { ...validUserData };
      req.body = userData;

      const error = new Error('Database connection failed');
      mockPool.query.mockRejectedValueOnce(error);

      await register(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        error: 'Error interno',
        details: 'Database connection failed'
      });
    });
  });

  describe('login', () => {
    it('should login user successfully', async () => {
      const loginData = {
        email: validUserData.email,
        password: validUserData.password
      };
      req.body = loginData;

      const hashedPassword = await hashPassword(loginData.password);
      const userResult = [{
        id: 1,
        name: validUserData.name,
        email: loginData.email,
        password: hashedPassword,
        is_premium: false
      }];

      mockPool.query.mockResolvedValueOnce([userResult]);

      await login(req, res);

      expect(mockPool.query).toHaveBeenCalledWith(
        'SELECT * FROM users WHERE email = ?',
        [loginData.email]
      );
      
      expect(res.json).toHaveBeenCalledWith({
        message: 'Login OK',
        token: expect.any(String),
        user: {
          id: 1,
          name: validUserData.name,
          email: loginData.email,
          is_premium: false
        }
      });
    });

    it('should return 401 for non-existent user', async () => {
      const loginData = {
        email: 'nonexistent@example.com',
        password: 'password123'
      };
      req.body = loginData;

      mockPool.query.mockResolvedValueOnce([[]]);

      await login(req, res);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        error: 'Usuario no encontrado'
      });
    });

    it('should return 401 for incorrect password', async () => {
      const loginData = {
        email: validUserData.email,
        password: 'wrongpassword'
      };
      req.body = loginData;

      const hashedPassword = await hashPassword('correctpassword');
      const userResult = [{
        id: 1,
        name: validUserData.name,
        email: loginData.email,
        password: hashedPassword,
        is_premium: false
      }];

      mockPool.query.mockResolvedValueOnce([userResult]);

      await login(req, res);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        error: 'Contraseña incorrecta'
      });
    });

    it('should return 500 for database errors', async () => {
      const loginData = {
        email: validUserData.email,
        password: validUserData.password
      };
      req.body = loginData;

      const error = new Error('Database connection failed');
      mockPool.query.mockRejectedValueOnce(error);

      await login(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        error: 'Database connection failed'
      });
    });
  });
});
