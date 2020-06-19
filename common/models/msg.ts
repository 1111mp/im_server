'use strict';

const moment = require('moment')

module.exports = (sequelize, DataTypes) => {
	const Msg = sequelize.define('Msg', {
		id: {
			type: DataTypes.INTEGER,
			primaryKey: true,
			autoIncrement: true,
			unique: true
		},
		msgId: {
			type: DataTypes.STRING,
			field: 'msg_id',
			unique: true,
			comment: '消息唯一id'
		},
		type: {
			type: DataTypes.INTEGER,
			comment: '消息类型 0 text 1 image 2 video 3 audio'
		},
		sessionType: {
			type: DataTypes.INTEGER,
			validate: {
				isIn: [[0, 1]]
			},
			comment: '会话类型 0 单聊 1 群聊'
		},
		content: {
			type: DataTypes.STRING,
			defaultValue: '',
			comment: '文本消息内容'
		},
		time: {
			type: DataTypes.INTEGER,
			comment: '消息发送时间'
		},
		resPath: {
			type: DataTypes.STRING,
			defaultValue: '',
			comment: '资源url'
		},
		status: {
			type: DataTypes.INTEGER,
			validate: {
				isIn: [[0, 1, 2, 3, 4]]
			},
			comment: '消息状态'
		},
		sender: {
			type: DataTypes.INTEGER,
			comment: '发送者userId'
		},
		reciver: {
			type: DataTypes.INTEGER,
			comment: '接收者 userId or groupId'
		},
		ext: {
			type: DataTypes.STRING,
			allowNull: true,
			comment: '预留字段 json'
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
				fields: ['sender', 'reciver', 'status', 'time']
			}
		]
	})

	Msg.associate = function (models: any) {

	}

	return Msg
}

export { }
