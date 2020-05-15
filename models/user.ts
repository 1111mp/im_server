const Sequelize = require('sequelize')
const moment = require('moment')
const bcrypt = require('bcrypt')
const sequelize = require('../sequelize')

const User = sequelize.define('user',
	{
		id: {
			type: Sequelize.INTEGER(11),
			// 设为主建
			primaryKey: true,
			// 自增
			autoIncrement: true
		},
		username: {
			type: Sequelize.STRING(32),
			// 唯一
			unique: 'username cannot be repeated'
		},
		pwd: {
			type: Sequelize.STRING(64),
			set(val) {
				// 对密码进行加密
				bcrypt.hash(val, 10, (err, hash) => {
					(this as any).setDataValue('pwd', hash)
				})
			}
		},
		createdAt: {
			type: Sequelize.DATE,
			defaultValue: Sequelize.NOW,
			get() {
				// this.getDataValue 获取当前字段value
				return moment((this as any).getDataValue('createdAt')).format('YYYY-MM-DD HH:mm')
			}
		},
		updatedAt: {
			type: Sequelize.DATE,
			defaultValue: Sequelize.NOW,
			get() {
				return moment((this as any).getDataValue('updatedAt')).format('YYYY-MM-DD HH:mm')
			}
		}
	},
	{
		// sequelize会自动使用传入的模型名（define的第一个参数）的复数做为表名 设置true取消默认设置
		freezeTableName: true
	}
)

module.exports = User

export { }