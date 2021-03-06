"use strict";

import { DataTypes } from "sequelize";

const moment = require("moment");
const bcrypt = require("bcrypt");

/** https://stackoverflow.com/questions/46357533/how-to-add-delete-new-columns-in-sequelize-cli/46357631 */
/**
 * 解决生成海量的索引的错误
 * https://www.chaoswork.cn/1064.html
 */
module.exports = (sequelize) => {
  const User = sequelize.define(
    "User",
    {
      id: {
        type: DataTypes.INTEGER,
        // 设为主建
        primaryKey: true,
        // 自增
        autoIncrement: true,
      },
      account: {
        type: DataTypes.STRING(11),
        validate: {
          is: /^1[3-9](\d{9})$/i,
        },
        // 唯一
        unique: "account",
        comment: "账号 手机号",
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
      regisTime: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
        get() {
          // this.getDataValue 获取当前字段value
          return moment((this as any).getDataValue("createdAt")).format(
            "YYYY-MM-DD HH:mm"
          );
        },
      },
      updateTime: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
        get() {
          return moment((this as any).getDataValue("updatedAt")).format(
            "YYYY-MM-DD HH:mm"
          );
        },
      },
    },
    {
      // freezeTableName: true,
      initialAutoIncrement: 10000,
      createdAt: "regisTime",
      updatedAt: "updateTime",
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
