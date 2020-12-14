"use strict";

import { DataTypes } from "sequelize";
import moment from "moment";

/** 双向好友关系 */
module.exports = (sequelize) => {
  const Friend = sequelize.define(
    "Friend",
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        unique: true,
      },
      userId: {
        type: DataTypes.INTEGER,
        field: "user_id",
        comment: "用户id",
      },
      friendId: {
        type: DataTypes.INTEGER,
        field: "friend_id",
        comment: "好友id",
      },
      userGroup: {
        type: DataTypes.STRING,
        field: "user_group",
        allowNull: true,
        comment: "用户分组",
      },
      friendGroup: {
        type: DataTypes.STRING,
        field: "friend_group",
        allowNull: true,
        comment: "好友分组",
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
      indexes: [
        {
          using: "BTREE",
          fields: ["user_id", "friend_id"],
        },
      ],
    }
  );

  Friend.associate = function (models: any) {};

  return Friend;
};
