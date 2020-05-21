const Sequelize = require('sequelize/lib/sequelize')
const moment = require('moment')
const bcrypt = require('bcrypt')
const sequelize = require('../sequelize')

/** https://juejin.im/post/5d81d4906fb9a06aeb10f378 */
/** https://juejin.im/post/5b6baf9a5188251aa0166d82 */
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
			allowNull: false,
			set(val) {
				// 对密码进行加密
				const hash = bcrypt.hashSync(val, 10);
				(this as any).setDataValue('pwd', hash);
			}
		},
		email: {
			type: Sequelize.STRING(64),
			allowNull: true,
			unique: 'email cannot be repeated',
			validate: {
				isEmail: true
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
		freezeTableName: true,
		initialAutoIncrement: 10000
	}
)

module.exports = User

export { }