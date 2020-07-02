const path = require("path")

module.exports = {
	secretOrPrivateKey: 'random str',
	logConfig: path.resolve(__dirname, './log4js.json'),
	unlessPaths: ['/', '/login', '/users/register', '/favicon.ico', /^\/upload/, /^\/stylesheets/],
	// token的有效时间 一个小时
	tokenExp: 30 * 24 * 60 * 60 * 1000,
	uploadPath: path.join(__dirname, '../public/upload'),
	uploadChunkPath: path.join(__dirname, '../public/upload/chunks')
}