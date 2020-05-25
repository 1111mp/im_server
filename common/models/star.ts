const Sequelize = require('sequelize/lib/sequelize')
const moment = require('moment')
const sequelize = require('../../sequelize')

/** 点赞 */
const Star = sequelize.define('star',
	{
		id: {
			type: Sequelize.INTEGER(11),
			primaryKey: true,
			autoIncrement: true,
			unique: true
		},
		dynamicId: {
			type: Sequelize.INTEGER(11),
			field: 'dynamic_id',
			unique: true,
			comment: '动态id'
		},
		userId: {
			type: Sequelize.INTEGER(11),
			field: 'user_id',
			unique: true,
			comment: '用户id'
		},
		createdAt: {
			type: Sequelize.DATE,
			defaultValue: Sequelize.NOW,
			get() {
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
		freezeTableName: true,
		charset: 'utf8',
		collate: 'utf8_general_ci'
	}
)

module.exports = Star

export { }
