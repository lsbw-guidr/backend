const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const db = require('../../data/dbConfig');

module.exports = {
	register: function(user) {
		if (process.env.NODE_ENV === 'testing') {
			return db('guides').insert(user);
		} else {
			return db('guides').insert(user, 'id');
		}
	},
	login: function(user) {
		return db('guides')
			.where({ username: user.username })
			.first();
	},
	hashPass: function(password, saltNum) {
		return bcrypt.hashSync(password, saltNum);
	},
	generateToken: function(user) {
		const secret = process.env.JWT_SECRET;
		const payload = { guide: user };
		const options = {
			expiresIn: '72h',
			jwtid: 'guidr'
		};
		return jwt.sign(payload, secret, options);
	},
	decodeToken: function(token, callback) {
		const secret = process.env.JWT_SECRET;
		const options = {
			expiresIn: '72h',
			jwtid: 'guidr'
		};
		if (callback) {
			return jwt.verify(token, secret, options, callback);
		} else {
			return jwt.verify(token, secret, options);
		}
	}
};
