'use strict';

const moment = require('moment')

module.exports = (sequelize, DataTypes) => {
	const FriSetting = sequelize.define('FriSetting', {
		id: {
			type: DataTypes.INTEGER(11),
			primaryKey: true,
			autoIncrement: true,
			unique: true
		},
		userId: {
			type: DataTypes.INTEGER,
			field: 'user_id',
			allowNull: false,
			comment: '用户id'
		},
		friendId: {
			type: DataTypes.INTEGER,
			field: 'friend_id',
			allowNull: false,
			comment: '好友id'
		},
		remark: {
			type: DataTypes.STRING,
			comment: '好友备注'
		},
		tags: {
			type: DataTypes.STRING,
			comment: '好友标签'
		},
		astrolabe: {
			type: DataTypes.BOOLEAN,
			allowNull: false,
			defaultValue: 0,
			comment: '星标好友'
		},
		block: {
			type: DataTypes.BOOLEAN,
			allowNull: false,
			defaultValue: 0,
			comment: '是否拉黑'
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
		indexes: [
			{
				using: 'BTREE',
				fields: ['user_id', 'friend_id']
			}
		]
	})

	FriSetting.associate = function (models: any) {

	}

	return FriSetting
}

export { }
