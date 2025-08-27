// Test configuration and setup
const mysql = require('mysql2/promise');

// Test database configuration
const testDbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '1234',
  database: process.env.DB_NAME || 'worktodo_test',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
};

// Create test database connection
const createTestDb = async () => {
  const connection = await mysql.createConnection({
    host: testDbConfig.host,
    user: testDbConfig.user,
    password: testDbConfig.password
  });
  
  await connection.execute(`CREATE DATABASE IF NOT EXISTS ${testDbConfig.database}`);
  await connection.end();
};

// Create test tables
const setupTestTables = async (pool) => {
  // Users table
  await pool.execute(`
    CREATE TABLE IF NOT EXISTS users (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      email VARCHAR(150) UNIQUE NOT NULL,
      password VARCHAR(255) NOT NULL,
      is_premium BOOLEAN DEFAULT FALSE
    )
  `);

  // Projects table
  await pool.execute(`
    CREATE TABLE IF NOT EXISTS projects (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      color VARCHAR(50),
      description TEXT,
      created_by INT NOT NULL,
      created_at BIGINT NOT NULL,
      FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE CASCADE
    )
  `);

  // Sections table
  await pool.execute(`
    CREATE TABLE IF NOT EXISTS sections (
      idSection INT AUTO_INCREMENT PRIMARY KEY,
      title VARCHAR(255) NOT NULL,
      description TEXT,
      color VARCHAR(50),
      createdAt BIGINT NOT NULL,
      project_id INT NOT NULL,
      user_id INT NOT NULL,
      FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )
  `);

  // Notes table
  await pool.execute(`
    CREATE TABLE IF NOT EXISTS notes (
      id INT AUTO_INCREMENT PRIMARY KEY,
      title VARCHAR(255) NOT NULL,
      section_id INT NOT NULL,
      user_id INT NOT NULL,
      created_at BIGINT NOT NULL,
      updated_at BIGINT,
      FOREIGN KEY (section_id) REFERENCES sections(idSection) ON DELETE CASCADE,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )
  `);

  // Note todos table
  await pool.execute(`
    CREATE TABLE IF NOT EXISTS note_todos (
      id INT AUTO_INCREMENT PRIMARY KEY,
      note_id INT NOT NULL,
      content TEXT NOT NULL,
      is_completed BOOLEAN DEFAULT FALSE,
      position INT DEFAULT 0,
      FOREIGN KEY (note_id) REFERENCES notes(id) ON DELETE CASCADE
    )
  `);
};

// Clean test database
const cleanTestDb = async (pool) => {
  await pool.execute('SET FOREIGN_KEY_CHECKS = 0');
  await pool.execute('TRUNCATE TABLE note_todos');
  await pool.execute('TRUNCATE TABLE notes');
  await pool.execute('TRUNCATE TABLE sections');
  await pool.execute('TRUNCATE TABLE projects');
  await pool.execute('TRUNCATE TABLE users');
  await pool.execute('SET FOREIGN_KEY_CHECKS = 1');
};

// Drop test database
const dropTestDb = async () => {
  const connection = await mysql.createConnection({
    host: testDbConfig.host,
    user: testDbConfig.user,
    password: testDbConfig.password
  });
  
  await connection.execute(`DROP DATABASE IF EXISTS ${testDbConfig.database}`);
  await connection.end();
};

// Close the pool of connections
const closePool = async (pool) => {
  await pool.end();
};

module.exports = {
  testDbConfig,
  createTestDb,
  setupTestTables,
  cleanTestDb,
  dropTestDb,
  closePool
};
