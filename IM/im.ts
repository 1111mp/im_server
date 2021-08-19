import { Server, Socket } from "socket.io";
import { Server as HttpServer } from "http";
import { verify } from "jsonwebtoken";
import { ExtendedError } from "socket.io/dist/namespace";
import { DB } from "../db";
import { RedisType } from "../redis";
import { SessionSocket } from "../types/im";
import { UserAttributes } from "../db/models/user";

export class IM {
  private io: Server;

  /**
   * @description Creates an instance of IM
   * @constructor
   * @param http_server
   * @param db
   * @param redis
   */
  public constructor(
    http_server: HttpServer,
    private db: DB,
    private redis: RedisType
  ) {
    this.io = new Server(http_server, {});

    // TODO middleware to verify user identity
    this.io.use(this.auth_middleware);
  }

  /**
   * @description middleware to verify user identity
   * @method {auth_middleware}
   * @param defaultSocket
   * @param next
   * @returns
   */
  private auth_middleware = async (
    defaultSocket: Socket,
    next: (err?: ExtendedError) => void
  ) => {
    const socket = <SessionSocket>defaultSocket;

    const { token, userid: userId } = <SocketHeaders>socket.handshake.headers;

    if (!token || !userId) return next(new Error("Authentication error"));

    const auth_key = `${process.env.USER_AUTH_KEY}::${userId}`;
    const real_token = await this.redis.instance.hget(auth_key, token);

    if (!real_token) return next(new Error("Authentication error"));

    try {
      const { id } = verify(
        real_token,
        process.env.SECRET_Key!
      ) as UserAttributes;

      socket.decoded = { userId: id };

      return next();
    } catch (err) {
      return next(new Error("Authentication error"));
    }
  };
}
