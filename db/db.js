const mysql = require('mysql2/promise');
const dotenv = require('dotenv');
dotenv.config();

// Lazy pool wrapper: do NOT create a pool at require-time.
// When running tests, `tests/setup.js` sets `global.testPool` and
// the wrapper will delegate queries to that pool. In production
// the wrapper will create a real pool on first use.

let internalPool = null;

const createInternalPool = () => {
  if (internalPool) return internalPool;
  internalPool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
  });

  internalPool.on('error', (err) => {
    console.error('Error en la conexi\u00f3n a la base de datos:', err);
  });

  return internalPool;
};

const getPool = () => {
  // Prefer a test pool created by the test harness
  if (typeof global !== 'undefined' && global.testPool) return global.testPool;
  return createInternalPool();
};

// Minimal proxy exposing execute/query methods used across the codebase.
// This keeps existing call sites (pool.query(...)) working.
const poolProxy = {
  query: (...args) => getPool().query(...args),
  execute: (...args) => getPool().execute(...args),
  getConnection: (...args) => getPool().getConnection(...args),
  // allow explicit shutdown of the internal pool if needed
  end: async () => {
    if (internalPool) {
      await internalPool.end();
      internalPool = null;
    }
  }
};

module.exports = poolProxy;
