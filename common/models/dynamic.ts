"use strict";

const { DataTypes } = require("sequelize");
const moment = require("moment");

module.exports = (sequelize) => {
  const Dynamic = sequelize.define(
    "Dynamic",
    {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: DataTypes.INTEGER(11),
      },
      userId: {
        type: DataTypes.INTEGER(11),
        allowNull: false,
        field: "user_id",
      },
      content: {
        type: DataTypes.STRING(500),
      },
      createdAt: {
        allowNull: false,
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
        get() {
          return moment((this as any).getDataValue("createdAt")).format(
            "YYYY-MM-DD HH:mm"
          );
        },
      },
      updatedAt: {
        allowNull: false,
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

  Dynamic.associate = function (models) {
    // associations can be defined here
    Dynamic.hasMany(models.Comment, {
      foreignKey: "dynamicId",
      sourceKey: "id",
    });
    Dynamic.hasMany(models.Star, { foreignKey: "dynamicId", sourceKey: "id" });
    Dynamic.hasMany(models.DynaSource, {
      name: "dynasource_dynamicid",
      foreignKey: "dynamicId",
      sourceKey: "id",
      onDelete: "CASCADE",
    });

    Dynamic.belongsTo(models.User, { foreignKey: "userId", targetKey: "id" });
  };

  return Dynamic;
};

export {};
