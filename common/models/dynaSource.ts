"use strict";

const { DataTypes } = require("sequelize");
const moment = require("moment");

module.exports = (sequelize) => {
  const DynaSource = sequelize.define(
    "DynaSource",
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
      url: {
        type: DataTypes.STRING,
        // validate: {
        // 	isUrl: true
        // },
        comment: "资源url",
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

  DynaSource.associate = function (models) {
    DynaSource.belongsTo(models.Dynamic, {
      foreignKey: "dynamicId",
      targetKey: "id",
    });

    DynaSource.belongsTo(models.User, {
      foreignKey: "userId",
      targetKey: "id",
    });
  };

  return DynaSource;
};

export {};
