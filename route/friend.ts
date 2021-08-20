import * as Router from "@koa/router";
import { FriendService } from "../services";
import { FriendController } from "../controllers/friend.controller";
import { DB } from "../db";
import { RedisType } from "../redis";

export function routes(db: DB, redis: RedisType) {
  const api = new Router();

  api.prefix("/api/friend");

  const friendController = new FriendController(new FriendService(db, redis));

  // get user all friends
  api.get("/getFriends", friendController.get_friends);
  // add friend
  api.post("/addFriend", friendController.friend_add);

  return api;
}
