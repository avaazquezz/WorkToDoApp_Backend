const bcrypt = require('bcrypt');
const saltRounds = 10;

const hashPassword = (password) => bcrypt.hash(password, saltRounds);
const comparePasswords = (password, hash) => bcrypt.compare(password, hash);

module.exports = { hashPassword, comparePasswords };
