const ip = require('ip')

let serverIp = null

module.exports = {
	client: function (req) {
		var clientIP = req.headers['x-forwarded-for'] ||
			req.connection && req.connection.remoteAddress ||
			req.connection && req.connection.socket && req.connection.socket.remoteAddress ||
			req.socket && req.socket.remoteAddress

		if (clientIP) {
			clientIP = clientIP.replace(/\:\:ffff\:/, '')
			if (clientIP.indexOf(',') !== -1) {
				clientIP = clientIP.substr(0, clientIP.indexOf(','))
			}
		}
		return clientIP
	},
	server: function () {
		if (serverIp === null) {
			serverIp = ip.address()
		}
		return serverIp
	}
}

export { }
