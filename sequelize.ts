const Sequelize = require('sequelize')
/** require 文档：https://github.com/demopark/sequelize-docs-Zh-CN/tree/v5 */

const sequelize = new Sequelize('test', 'root', 'root', {
	host: 'localhost',
	port: '3306',
	dialect: 'mysql',
	pool: {
		max: 5,
		min: 0,
		acquire: 30000,
		idle: 10000
	}
})

sequelize
	.authenticate()
	.then(() => {
		console.log('数据库mysql 连接成功...')
	})
	.catch(err => {
		console.error('数据库mysql 连接失败...', err)
	})

/** 根据model 一次性自动创建所有 */
sequelize.sync()

module.exports = sequelize

export { }
