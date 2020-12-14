import { DataTypes } from "sequelize";
import moment from "moment";

module.exports = (sequelize) => {
  const Notify = sequelize.define(
    "Notify",
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        unique: true,
      },
      msgId: {
        type: DataTypes.STRING,
        field: "msg_id",
        unique: true,
        comment: "消息唯一id",
      },
      type: {
        type: DataTypes.INTEGER,
        validate: {
          isIn: [[1, 2, 3]],
        },
        comment: "通知类型",
      },
      time: {
        type: DataTypes.INTEGER,
        comment: "通知发送时间",
      },
      status: {
        type: DataTypes.INTEGER,
        validate: {
          isIn: [[0, 1, 2, 3]],
        },
        comment: "通知状态",
      },
      sender: {
        type: DataTypes.INTEGER,
        comment: "发送者userId",
      },
      reciver: {
        type: DataTypes.INTEGER,
        comment: "接收者 userId",
      },
      remark: {
        type: DataTypes.STRING,
        defaultValue: "",
        comment: "备注",
      },
      ext: {
        type: DataTypes.STRING,
        defaultValue: "",
        comment: "预留字段 json",
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
          fields: ["sender", "reciver", "status", "time"],
        },
      ],
    }
  );

  Notify.associate = function (models: any) {};

  return Notify;
};
