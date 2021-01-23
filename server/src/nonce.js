const crypto = require('crypto');

const getNonce = function() {
	return crypto.randomBytes(16).toString('base64');
};

module.exports = getNonce;
