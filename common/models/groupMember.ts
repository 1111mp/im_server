'use strict';

const moment = require('moment')

module.exports = (sequelize, DataTypes) => {
	const GroupMember = sequelize.define('GroupMember', {
		id: {
			type: DataTypes.INTEGER,
			primaryKey: true,
			autoIncrement: true,
			unique: true
		},
		groupId: {
			type: DataTypes.INTEGER,
			field: 'group_id',
			comment: '群id'
		},
		userId: {
			type: DataTypes.INTEGER,
			field: 'user_id',
			comment: '用户id'
		},
		createdAt: {
			type: DataTypes.DATE,
			defaultValue: DataTypes.NOW,
			get() {
				return moment((this as any).getDataValue('createdAt')).format('YYYY-MM-DD HH:mm')
			}
		},
		updatedAt: {
			type: DataTypes.DATE,
			defaultValue: DataTypes.NOW,
			get() {
				return moment((this as any).getDataValue('updatedAt')).format('YYYY-MM-DD HH:mm')
			}
		}
	}, {

	})

	GroupMember.associate = function (models: any) {

		GroupMember.belongsTo(models.ChatGroup, { foreignKey: 'groupId', targetKey: 'id' })
		// GroupMember.belongsTo(models.User, { foreignKey: 'userId', targetKey: 'id' })

	}

	return GroupMember

}

export { }
