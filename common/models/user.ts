"use strict";

const moment = require("moment");
const bcrypt = require("bcrypt");

/** https://stackoverflow.com/questions/46357533/how-to-add-delete-new-columns-in-sequelize-cli/46357631 */
/**
 * 解决生成海量的索引的错误
 * https://www.chaoswork.cn/1064.html
 */
module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define(
    "User",
    {
      id: {
        type: DataTypes.INTEGER(11),
        // 设为主建
        primaryKey: true,
        // 自增
        autoIncrement: true,
      },
      username: {
        type: DataTypes.STRING(32),
        // 唯一
        unique: "username",
        comment: "用户名",
      },
      pwd: {
        type: DataTypes.STRING(64),
        allowNull: false,
        set(val) {
          // 对密码进行加密
          const hash = bcrypt.hashSync(val, 10);
          (this as any).setDataValue("pwd", hash);
        },
        comment: "用户密码",
      },
      avatar: {
        type: DataTypes.STRING,
        comment: "用户头像",
      },
      email: {
        type: DataTypes.STRING(64),
        allowNull: true,
        unique: "email",
        validate: {
          isEmail: true,
        },
        comment: "用户邮箱",
      },
      createdAt: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
        get() {
          // this.getDataValue 获取当前字段value
          return moment((this as any).getDataValue("createdAt")).format(
            "YYYY-MM-DD HH:mm"
          );
        },
      },
      updatedAt: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
        get() {
          return moment((this as any).getDataValue("updatedAt")).format(
            "YYYY-MM-DD HH:mm"
          );
        },
      },
      regisTime: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
        get() {
          // this.getDataValue 获取当前字段value
          return moment((this as any).getDataValue("regisTime")).format(
            "YYYY-MM-DD HH:mm"
          );
        },
      },
      updateTime: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
        get() {
          return moment((this as any).getDataValue("updateTime")).format(
            "YYYY-MM-DD HH:mm"
          );
        },
      },
    },
    {
      // freezeTableName: true,
      initialAutoIncrement: 10000,
    }
  );

  User.associate = function (models) {
    // associations can be defined here
    User.hasMany(models.Dynamic, { foreignKey: "userId", sourceKey: "id" });
    User.hasMany(models.Comment, { foreignKey: "userId", sourceKey: "id" });
    User.hasMany(models.Star, { foreignKey: "userId", sourceKey: "id" });
    // User.hasMany(models.GroupMember, { foreignKey: 'userId', sourceKey: 'id' })
    User.hasMany(models.DynaSource, {
      name: "dynasource_userid",
      foreignKey: "userId",
      sourceKey: "id",
      onDelete: "CASCADE",
    });
  };

  return User;
};
