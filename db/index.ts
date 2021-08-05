import { Sequelize } from "sequelize";

// https://github.com/EnetoJara/resume-app/blob/master/src/server/models/index.ts
import { UserFactory, UserStatic } from "./models/user";
import { FriendFactory, FriendStatic } from "./models/friend";
import {
  FriendSettingFactory,
  FriendSettingStatic,
} from "./models/friend_setting";

export type DB = {
  sequelize: Sequelize;
  User: UserStatic;
  Friend: FriendStatic;
  FriendSetting: FriendSettingStatic;
};

const sequelize = new Sequelize(
  process.env.DB_NAME!,
  process.env.DB_USER!,
  process.env.DB_PASS!,
  {
    port: Number(process.env.DB_PORT),
    host: process.env.DB_HOST || "127.0.0.1",
    dialect: "mysql",
    pool: {
      min: 0,
      max: 5,
      acquire: 30000,
      idle: 10000,
    },
    timezone: "+08:00",
    define: {
      charset: "utf8",
    },
    dialectOptions: {
      // collate: "utf8_general_ci",
    },
  }
);

const User = UserFactory(sequelize);
const Friend = FriendFactory(sequelize);
const FriendSetting = FriendSettingFactory(sequelize);

// User.hasMany()

export const db: DB = {
  sequelize,
  User,
  Friend,
  FriendSetting,
};
