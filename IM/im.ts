import { Server, Socket } from "socket.io";
import { Server as HttpServer } from "http";
import { verify } from "jsonwebtoken";
import { ExtendedError } from "socket.io/dist/namespace";
import { DB } from "../db";
import { RedisType } from "../redis";
import { UserAttributes } from "../db/models/user";

interface ClientToServerEvents {
  noArg: () => void;
  basicEmit: (a: number, b: string, c: number[]) => void;
}

interface ServerToClientEvents {
  withAck: (d: string, cb: (e: number) => void) => void;
}

const io = new Server<ClientToServerEvents, ServerToClientEvents>(3000);

io.on("connect", (socket) => {
  socket.on("noArg", () => {
    // ...
  });

  socket.on("basicEmit", (a, b, c) => {
    // ...
  });

  socket.emit("withAck", "42", (e) => {
    console.log(e);
  });
});

// io.on("basicEmit", (a, b, c) => {});

// // https://socket.io/docs/v3/migrating-from-3-x-to-4-0/#Typed-events
// io.emit("withAck", "42", (e) => {
//   console.log(e);
// });

export class IM {
  private io: Server<ClientToServerEvents, ServerToClientEvents>;

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
    this.io = new Server<ClientToServerEvents, ServerToClientEvents>(
      http_server,
      {}
    );

    this.io.on("basicEmit", (a) => {});

    // TODO middleware to verify user identity
    this.io.use(this.auth_middleware);

    // event of connection
    // this.io.on;

    // event of error
    this.io.on("error", (err) => {
      console.log(err);
    });
  }

  /**
   * @description middleware to verify user identity
   * @method {auth_middleware}
   * @param defaultSocket
   * @param next
   * @returns
   */
  private auth_middleware = async (
    socket: Socket,
    next: (err?: ExtendedError) => void
  ) => {
    const { token, userid: userId } = socket.handshake.headers;

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
