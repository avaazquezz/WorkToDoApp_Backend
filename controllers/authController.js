// backend/controllers/auth.js
require('dotenv').config();
const pool = require('../db/db');
const jwt = require('jsonwebtoken');
const { hashPassword, comparePasswords } = require('../utils/hash');
const logger = require('../utils/logger'); // Agregar un logger
const SECRET = process.env.JWT_SECRET;

if (!SECRET) {
  throw new Error('JWT_SECRET no está configurado en el archivo .env');
}

// Registrar usuario
const register = async (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password) {
    return res.status(400).json({ error: 'Todos los campos son obligatorios' });
  }
  try {
    const hashed = await hashPassword(password);
    const [result] = await pool.query(
      'INSERT INTO users (name, email, password) VALUES (?, ?, ?)',
      [name, email, hashed]
    );
    // Generamos token
    const token = jwt.sign({ id: result.insertId, email }, SECRET, { expiresIn: '7d' });
    return res.status(201).json({
      message: 'Usuario registrado',
      token,
      user: { id: result.insertId, name, email }
    });
  } catch (err) {
    logger.error('Error en el registro:', err); // Log detallado
    if (err.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ error: 'El correo electrónico ya está registrado' });
    }
    return res.status(500).json({ error: 'Error interno', details: err.message });
  }
};

// Login usuario
const login = async (req, res) => {
  const { email, password } = req.body;
  try {
    const [results] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
    const user = results[0];
    if (!user) return res.status(401).json({ error: 'Usuario no encontrado' });
    const isMatch = await comparePasswords(password, user.password);
    if (!isMatch) return res.status(401).json({ error: 'Contraseña incorrecta' });

    const token = jwt.sign({ id: user.id, email }, SECRET, { expiresIn: '7d' });
    return res.json({
      message: 'Login OK',
      token,
      user: { id: user.id, name: user.name, email: user.email, is_premium: user.is_premium }
    });
  } catch (err) {
    logger.error('Error en el login:', err); // Log detallado
    return res.status(500).json({ error: err.message });
  }
};

module.exports = { register, login };
