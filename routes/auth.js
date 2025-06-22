const express = require('express');
const router = express.Router();
const { register, login } = require('../controllers/authController');
const passport = require('passport');

// Registro y login manual
router.post('/register', register);
router.post('/login', login);

module.exports = router;
