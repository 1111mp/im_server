import { Sequelize } from "sequelize";
import Config from "../config/sequelize.json";

import { UserFactory, UserStatic } from "./models/user";

export type DB = {
  sequelize: Sequelize;
  User: UserStatic;
};

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASS,
  {
    port: Number(process.env.DB_HOST),
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
      collate: "utf8_general_ci",
    },
  }
);

const User = UserFactory(sequelize);

export const db: DB = {
  sequelize,
  User,
};
