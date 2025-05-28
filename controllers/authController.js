require('dotenv').config();

const db = require('../db/db');
const jwt = require('jsonwebtoken');
const { hashPassword, comparePasswords } = require('../utils/hash');
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;

const SECRET = process.env.JWT_SECRET || "devsecret";

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
    (accessToken, refreshToken, profile, done) => {
      const { id, displayName, emails } = profile;
      const email = emails[0].value;

      // Buscar o crear usuario en la base de datos
      db.query(
        'SELECT * FROM users WHERE email = ?',
        [email],
        (err, results) => {
          if (err) return done(err);

          if (results.length > 0) {
            return done(null, results[0]);
          } else {
            db.query(
              'INSERT INTO users (name, email, password) VALUES (?, ?, ?)',
              [displayName, email, null],
              (err, result) => {
                if (err) return done(err);
                const newUser = { id: result.insertId, name: displayName, email };
                return done(null, newUser);
              }
            );
          }
        }
      );
    }
  )
);

// Serializar usuario
passport.serializeUser((user, done) => {
  done(null, user.id);
});

// Deserializar usuario
passport.deserializeUser((id, done) => {
  db.query('SELECT * FROM users WHERE id = ?', [id], (err, results) => {
    if (err) return done(err);
    done(null, results[0]);
  });
});

// Registrar usuario
const register = async (req, res) => {
  const { name, email, password } = req.body;
  const hashed = await hashPassword(password);

  db.query('INSERT INTO users (name, email, password) VALUES (?, ?, ?)', [name, email, hashed], (err, result) => {
    if (err) return res.status(500).json({ error: err });
    res.status(201).json({ message: "Usuario registrado", userId: result.insertId });
  });
};

// Login usuario
const login = (req, res) => {
  const { email, password } = req.body;
  db.query('SELECT * FROM users WHERE email = ?', [email], async (err, results) => {
    if (err || results.length === 0) return res.status(401).json({ error: 'Usuario no encontrado' });

    const user = results[0];
    const isMatch = await comparePasswords(password, user.password);
    if (!isMatch) return res.status(401).json({ error: 'Contraseña incorrecta' });

    const token = jwt.sign({ id: user.id, email: user.email }, SECRET, { expiresIn: '7d' });
    res.json({ token, user: { id: user.id, name: user.name, email: user.email, is_premium: user.is_premium } });
  });
};

module.exports = { register, login };
