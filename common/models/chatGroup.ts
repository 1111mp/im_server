"use strict";

const { DataTypes } = require("sequelize");
const moment = require("moment");

module.exports = (sequelize) => {
  const ChatGroup = sequelize.define(
    "ChatGroup",
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        unique: true,
      },
      groupName: {
        type: DataTypes.STRING,
        field: "group_name",
        defaultValue: "null",
        comment: "群组名称",
      },
      groupAvatar: {
        type: DataTypes.STRING,
        field: "group_avatar",
        defaultValue: "null",
        comment: "群组头像",
      },
      groupType: {
        type: DataTypes.INTEGER,
        field: "group_type",
        validate: {
          isIn: [[1, 2]],
        },
        comment: "群组类型 1基础群 2超大群",
      },
      groupMax: {
        type: DataTypes.INTEGER,
        field: "group_max",
        comment: "群组成员数量限制",
      },
      groupCreator: {
        type: DataTypes.INTEGER,
        field: "group_creator",
        comment: "群组创建者userId",
        allowNull: false,
      },
      createdAt: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
        get() {
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
    },
    {
      initialAutoIncrement: 10000,
    }
  );

  ChatGroup.associate = function (models: any) {
    ChatGroup.hasMany(models.GroupMember, {
      foreignKey: "groupId",
      sourceKey: "id",
    });
  };

  return ChatGroup;
};

export {};
