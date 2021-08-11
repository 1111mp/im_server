import * as Router from "@koa/router";
import { IMController } from "../controllers/im.controller";
import { DB } from "../db";
import { RedisType } from "../redis";
import { IMService } from "../services";

export function routes(db: DB, redis: RedisType) {
  const api = new Router();

  api.prefix("/api/im");

  const imController = new IMController(new IMService(db, redis));

  // create group
  api.post("/createGroup", imController.create_group);
  // get group info by id
  api.get("/getGroupInfoById", imController.getGroupInfoById);

  return api;
}
