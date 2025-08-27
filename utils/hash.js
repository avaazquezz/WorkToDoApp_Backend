const bcrypt = require('bcrypt');
const saltRounds = 10;

const hashPassword = async (password) => {
	if (!password || typeof password !== 'string' || password.length === 0) {
		throw new Error('Invalid password');
	}
	return bcrypt.hash(password, saltRounds);
};

const comparePasswords = async (password, hash) => {
	if (!hash || typeof hash !== 'string' || !/^\$2[aby]\$/.test(hash)) {
		throw new Error('Invalid hash');
	}
	return bcrypt.compare(password, hash);
};

module.exports = { hashPassword, comparePasswords };
