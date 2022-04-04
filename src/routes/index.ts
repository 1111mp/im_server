import Router from "@koa/router";
import { DB } from "../db";
import { DefaultContext, DefaultState } from "koa";
import { RedisType } from "../redis";

import { routes as SwaggerRoutes } from "./swagger";
import { routes as UserRoutes } from "./user";
import { routes as IMRoutes } from "./im";
import { routes as FriendRoutes } from "./friend";

export function routes(
  db: DB,
  redis: RedisType
): { [key: string]: Router<DefaultState, DefaultContext> } {
  const swagger = SwaggerRoutes();
  // the router of user
  const user = UserRoutes(db, redis);
  // the router of im
  const im = IMRoutes(db, redis);
  // the router of friend
  const friend = FriendRoutes(db, redis);

  return {
    swagger,
    user,
    im,
    friend,
  };
}
