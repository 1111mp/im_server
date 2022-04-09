import { BuildOptions, DataTypes, Model, Optional, Sequelize } from "sequelize";

import { hashSync } from "bcrypt";
import * as moment from "moment";

export interface UserModel
  extends Model<User.DB.UserAttributes, User.DB.UserCreationAttributes>,
    User.DB.UserAttributes {}
export class User extends Model<UserModel, User.DB.UserAttributes> {}

export type UserStatic = typeof Model & {
  new (values?: object, options?: BuildOptions): UserModel;
};

export function UserFactory(sequelize: Sequelize) {
  return <UserStatic>sequelize.define(
    "user",
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
          const hash = hashSync(val, 10);
          this.setDataValue("pwd", hash);
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
          return moment(this.getDataValue("regisTime")).format(
            "YYYY-MM-DD HH:mm"
          );
        },
      },
      updateTime: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
        get() {
          return moment(this.getDataValue("updateTime")).format(
            "YYYY-MM-DD HH:mm"
          );
        },
      },
    },
    {
      initialAutoIncrement: "10000",
      createdAt: "regisTime",
      updatedAt: "updateTime",
    }
  );
}
