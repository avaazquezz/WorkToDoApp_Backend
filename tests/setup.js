// Global test setup
const mysql = require('mysql2/promise');
const { testDbConfig, createTestDb, setupTestTables, dropTestDb } = require('./helpers/testDb');

// Global setup before all tests
beforeAll(async () => {
  // Set test environment variables
  process.env.NODE_ENV = 'test';
  process.env.JWT_SECRET = 'test_jwt_secret_key';
  process.env.DB_HOST = testDbConfig.host;
  process.env.DB_USER = testDbConfig.user;
  process.env.DB_PASSWORD = testDbConfig.password;
  process.env.DB_NAME = testDbConfig.database;
  
  // Create test database
  await createTestDb();
  
  // Create connection pool for tests
  global.testPool = mysql.createPool(testDbConfig);
  
  // Setup tables
  await setupTestTables(global.testPool);
}, 30000);

// Global cleanup after all tests
afterAll(async () => {
  if (global.testPool) {
    await global.testPool.end();
  }
  await dropTestDb();
}, 30000);

// Increase timeout for database operations
jest.setTimeout(30000);
