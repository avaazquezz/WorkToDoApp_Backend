const express = require('express');
const router = express.Router();
const { register, login } = require('../controllers/authController');
const passport = require('passport');

// Registro y login manual
router.post('/register', register);
router.post('/login', login);

// Ruta para iniciar sesión con Google
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

// Ruta de callback de Google
router.get('/google/callback', passport.authenticate('google', { failureRedirect: '/' }), (req, res) => {
  // Redirigir al usuario después de iniciar sesión con éxito
  res.redirect('/dashboard');
});

module.exports = router;
