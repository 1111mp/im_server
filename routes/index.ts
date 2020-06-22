const fs = require('fs')
const path = require('path')

const basename = path.basename(__filename)
const routes = {}

function loadRoutes(files, dirname) {
	files.filter(file => (file !== basename))
		.forEach(file => {
			const currentFile = path.resolve(dirname, file)
			if (fs.lstatSync(path.resolve(currentFile)).isDirectory()) {
				/** 是文件夹 */
				loadRoutes(fs.readdirSync(currentFile), path.resolve(__dirname, currentFile))
			} else if (file.indexOf('.') !== 0 && file.slice(-3) === '.ts') {
				const route = file.split('.')[0]
				routes[route] = require(path.resolve(currentFile))
			}
		})
}

loadRoutes(fs.readdirSync(__dirname), __dirname)

module.exports = routes

export { }
