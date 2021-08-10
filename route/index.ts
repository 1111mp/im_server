import Router from "@koa/router";
import { DB } from "../db";
import { RedisType } from "../redis";

import { routes as UserRoutes } from "./user";

export function routes(
  db: DB,
  redis: RedisType
): { [key: string]: Router<any, {}> } {
  // the router of user
  const user = UserRoutes(db, redis);

  return {
    user,
  };
}
