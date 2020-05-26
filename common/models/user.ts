'use strict';

const moment = require('moment')
const bcrypt = require('bcrypt')

/** https://stackoverflow.com/questions/46357533/how-to-add-delete-new-columns-in-sequelize-cli/46357631 */
module.exports = (sequelize, DataTypes) => {

	const User = sequelize.define('User', {
		id: {
			type: DataTypes.INTEGER(11),
			// 设为主建
			primaryKey: true,
			// 自增
			autoIncrement: true
		},
		userId: {
			type: DataTypes.UUID,
			unique: true,
			defaultValue: DataTypes.UUIDV4,
			comment: '用户id'
		},
		username: {
			type: DataTypes.STRING(32),
			// 唯一
			unique: true,
			comment: '用户名'
		},
		pwd: {
			type: DataTypes.STRING(64),
			allowNull: false,
			set(val) {
				// 对密码进行加密
				const hash = bcrypt.hashSync(val, 10);
				(this as any).setDataValue('pwd', hash);
			},
			comment: '用户密码'
		},
		email: {
			type: DataTypes.STRING(64),
			allowNull: true,
			unique: true,
			validate: {
				isEmail: true
			},
			comment: '用户邮箱'
		},
		createdAt: {
			type: DataTypes.DATE,
			defaultValue: DataTypes.NOW,
			get() {
				// this.getDataValue 获取当前字段value
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
		// freezeTableName: true,
		initialAutoIncrement: 10000
	});

	User.associate = function (models) {
		// associations can be defined here
		User.hasMany(models.Dynamic, { foreignKey: 'userId', sourceKey: 'id' })
		User.hasMany(models.Comment, { foreignKey: 'userId', sourceKey: 'id' })
		User.hasMany(models.Star, { foreignKey: 'userId', sourceKey: 'id' })
	};

	return User;
};