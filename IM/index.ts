import { IM } from "./im";
import { Server } from "http";
import { DB } from "../db";
import { RedisType } from "../redis";

export function IMInitialization(
  http_server: Server,
  db: DB,
  redis: RedisType
) {
  const im = new IM(http_server, db, redis);

  return im;
}
