require('dotenv').config();

const pool = require('../db/db');
const jwt = require('jsonwebtoken');
const { hashPassword, comparePasswords } = require('../utils/hash');
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;

const SECRET = process.env.JWT_SECRET;

if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
  throw new Error('GOOGLE_CLIENT_ID o GOOGLE_CLIENT_SECRET no están definidos en las variables de entorno.');
}

// Configurar estrategia de Google
passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: '/api/auth/google/callback',
    },
    async (accessToken, refreshToken, profile, done) => {
      const { id, displayName, emails } = profile;
      const email = emails[0].value;
      try {
        const [results] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
        if (results.length > 0) {
          return done(null, results[0]);
        } else {
          const [result] = await pool.query(
            'INSERT INTO users (name, email, password) VALUES (?, ?, ?)',
            [displayName, email, null]
          );
          const newUser = { id: result.insertId, name: displayName, email };
          return done(null, newUser);
        }
      } catch (err) {
        return done(err);
      }
    }
  )
);

// Serializar usuario
passport.serializeUser((user, done) => {
  done(null, user.id);
});

// Deserializar usuario
passport.deserializeUser(async (id, done) => {
  try {
    const [results] = await pool.query('SELECT * FROM users WHERE id = ?', [id]);
    done(null, results[0]);
  } catch (err) {
    done(err);
  }
});

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
    res.status(201).json({ message: 'Usuario registrado', userId: result.insertId });
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ error: 'El correo electrónico ya está registrado' });
    }
    res.status(500).json({ error: 'Error interno del servidor', details: err.message });
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

    const token = jwt.sign({ id: user.id, email: user.email }, SECRET, { expiresIn: '7d' });
    res.json({ token, user: { id: user.id, name: user.name, email: user.email, is_premium: user.is_premium } });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = { register, login };
