import * as Router from "@koa/router";
import { UserController } from "../controllers/user.controller";
import { DB } from "../db";
import { RedisType } from "../redis";
import { UserService } from "../services";

export function routes(db: DB, redis: RedisType) {
  const api = new Router();

  api.prefix("/api");

  const userController = new UserController(new UserService(db), redis);

  // register user
  api.post("/register", userController.register);
  // user login
  api.post("login", userController.login);

  return api;
}
