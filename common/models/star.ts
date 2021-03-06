"use strict";

const { DataTypes } = require("sequelize");
const moment = require("moment");

module.exports = (sequelize) => {
  const Star = sequelize.define(
    "Star",
    {
      id: {
        type: DataTypes.INTEGER(11),
        primaryKey: true,
        autoIncrement: true,
        unique: true,
      },
      userId: {
        type: DataTypes.INTEGER(11),
        field: "user_id",
        comment: "用户id",
      },
      dynamicId: {
        type: DataTypes.INTEGER(11),
        field: "dynamic_id",
        comment: "动态id",
      },
      status: {
        type: DataTypes.INTEGER,
        validate: {
          isIn: [[0, 1]],
        },
        comment: "点赞状态 0取消 1点赞",
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
    {}
  );

  Star.associate = function (models) {
    // associations can be defined here
    Star.belongsTo(models.Dynamic, {
      foreignKey: "dynamicId",
      targetKey: "id",
    });

    Star.belongsTo(models.User, { foreignKey: "userId", targetKey: "id" });
  };

  return Star;
};

export {};
