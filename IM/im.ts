import { Server, Socket } from "socket.io";
import { Server as HttpServer } from "http";
import { verify } from "jsonwebtoken";
import { ExtendedError } from "socket.io/dist/namespace";
import { DB } from "../db";
import { RedisType } from "../redis";

import { v4 } from "uuid";
import { messagepackage } from "../proto/proto";

interface ClientToServerEvents {
  noArg: () => void;
  basicEmit: (a: number, b: string, c: number[]) => void;
}

interface ServerToClientEvents {
  notify: (notify: Uint8Array, cb: (response: Uint8Array) => void) => void;
}

/**
 * @description IM
 * @class
 * @public
 */
export class IM {
  private io: Server<ClientToServerEvents, ServerToClientEvents>;

  private users: Map<number, string>;

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
    this.users = new Map();

    this.io = new Server<ClientToServerEvents, ServerToClientEvents>(
      http_server,
      {}
    );

    // TODO middleware to verify user identity
    this.io.use(this.auth_middleware);

    // event of connection
    this.io.on("connection", (socket) => {
      const { userId } = socket.decoded;

      this.users.set(userId, socket.id);

      // Fired upon disconnection.
      socket.on("disconnect", (reason) => {
        this.disconnect(userId);
      });
    });
  }

  /**
   * @description middleware to verify user identity
   * @method {auth_middleware}
   * @param socket Socket
   * @param next (err?: ExtendedError) => void
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

  /**
   * @private
   * @description Fired upon disconnection to remove user from users
   * @method {disconnect}
   * @param userId number
   */
  private disconnect = (userId: number) => {
    this.users.delete(userId);
  };

  msg_send(msg: MessageText): void;
  msg_send(msg: MessageImage): void;
  public msg_send() {}

  public notify_send = async ({
    type,
    sender,
    reciver,
    remark,
    ext,
  }: Pick<Notify, "type" | "sender" | "reciver" | "remark" | "ext">) => {
    // notify
    const notify: Notify = {
      id: v4(),
      type,
      sender,
      reciver,
      time: Date.now(),
      remark,
      ext,
    };

    try {
      if (this.users.has(reciver)) {
        // user online
        const notify_proto = this.notify_to_proto(notify);

        const emit_promise: Promise<messagepackage.IAckResponse> = new Promise(
          (resolve) => {
            this.io.to(this.users.get(reciver)!).emit(
              "notify",
              notify_proto,
              this.ack_parsed_response((res) => {
                resolve(res);
              })
            );
          }
        );

        const result = await this.promise_race([emit_promise], 6000);

        if (result.code === StatusCode.Success) {
          // successed
        } else {
          // failed to log
        }
      } else {
        // user offline
      }
    } catch (err) {
      // return Promise.resolve(Result.error);
    }
  };

  private notify_to_proto = (notify: messagepackage.INotify) => {
    const proto = messagepackage.Notify.create(notify);

    return messagepackage.Notify.encode(proto).finish();
  };

  private ack_parsed_response = (
    cb: (res: messagepackage.IAckResponse) => void
  ) => {
    return (reponse: Uint8Array) => {
      const parsed_response = messagepackage.AckResponse.decode(reponse);

      return cb(parsed_response);
    };
  };

  private promise_race = (
    promises: Promise<messagepackage.IAckResponse>[],
    timer: number = 3000
  ): Promise<messagepackage.IAckResponse> => {
    const timeout: Promise<messagepackage.IAckResponse> = new Promise(
      (resolve) => {
        setTimeout(() => {
          resolve({ code: StatusCode.Timeout, msg: "timeout" });
        }, timer);
      }
    );

    return Promise.race([timeout, ...promises]);
  };
}
