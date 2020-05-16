const path = require("path")

module.exports = {
	secretOrPrivateKey: 'random str',
	logConfig: path.resolve(__dirname, './log4js.json'),
	unlessPaths: ['/login', '/register'],
	// token的有效时间 一个小时
	tokenExp: 60 * 60 * 1000
}