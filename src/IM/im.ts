import { Server, Socket } from "socket.io";
import { Server as HttpServer } from "http";
import { verify } from "jsonwebtoken";
import { DB } from "../db";
import { RedisType } from "../redis";

import { v4 } from "uuid";
import { messagepackage } from "../proto/proto";

type Callback = (response: Uint8Array) => void;
type EventType = (msg: Uint8Array, cb: Callback) => void;

interface ClientToServerEvents {
  onSendMsg: EventType;
  onNotify: EventType;
}

interface ServerToClientEvents {
  notify: (notify: Uint8Array, cb: Callback) => void;
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

      socket.on("onSendMsg", (msg, cb) => {
        this.onSendMsg(msg, cb);
      });

      socket.on("onNotify", (notify, cb) => {
        this.onNotify(this.notify_parsed(notify), cb);
      });

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
   * @param next (err?: Error) => void
   * @returns
   */
  private auth_middleware = async (
    socket: Socket,
    next: (err?: Error) => void
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
      ) as User.DB.UserAttributes;

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

  /**
   * @description send msg
   * @public
   * @method {msg_send}
   * @param msg MessageText | MessageImage
   */
  public msg_send(msg: ModuleIM.Core.MessageText | ModuleIM.Core.MessageImage) {
    if (msg.type === ModuleIM.Common.MsgType.Text) {
      msg.text;
    } else {
    }
  }

  private onSendMsg: EventType = (msg, cb) => {};

  /**
   * @description send notify
   * @public
   * @method {notify_send}
   * @param { type, sender, receiver, remark, ext }
   * @returns
   */
  public notify_send = async (
    notify: ModuleIM.Core.Notify
  ): Promise<{
    code: Response.StatusCode;
    msg: string;
  }> => {
    const { id, receiver } = notify;

    try {
      if (this.users.has(receiver)) {
        // user online
        const notify_proto = this.notify_to_proto(notify);

        const emit_promise: Promise<messagepackage.IAckResponse> = new Promise(
          (resolve) => {
            this.io.to(this.users.get(receiver)!).emit(
              "notify",
              notify_proto,
              this.ack_parsed_response((res) => {
                resolve(res);
              })
            );
          }
        );

        const result = await this.promise_race([emit_promise], 6000);

        if (result.code === Response.StatusCode.Success) {
          await this.db.Notify.update(
            { status: ModuleIM.Common.NotifyStatus.Received },
            {
              where: {
                id,
              },
            }
          );
          // successed
          return {
            code: Response.StatusCode.Success,
            msg: "successed",
          };
        } else {
          // failed to log
          return {
            code: Response.StatusCode.Timeout,
            msg: "timeouted.",
          };
        }
      } else {
        // user offline. save to redis.

        return {
          code: Response.StatusCode.Success,
          msg: "",
        };
      }
    } catch (err) {
      return {
        code: Response.StatusCode.ServerError,
        msg: `${err.name}: ${err.message}`,
      };
    }
  };

  private onNotify = (notify: ModuleIM.Core.Notify, cb: Callback) => {};

  /**********************************utils*************************************/

  private msg_to_proto = (
    msg: ModuleIM.Core.MessageText | ModuleIM.Core.MessageImage
  ) => {
    const proto = messagepackage.Message.create(msg);

    return messagepackage.Message.encode(proto).finish();
  };

  private msg_parsed = (msg: Uint8Array) => {
    const parsed_msg = messagepackage.Message.decode(msg);

    return messagepackage.Message.toObject(parsed_msg, {
      longs: String,
      enums: String,
      bytes: String,
    }) as ModuleIM.Core.MessageText | ModuleIM.Core.MessageImage;
  };

  private notify_to_proto = (notify: messagepackage.INotify) => {
    const proto = messagepackage.Notify.create(notify);

    return messagepackage.Notify.encode(proto).finish();
  };

  private notify_parsed = (notify: Uint8Array) => {
    const parsed_notify = messagepackage.Notify.decode(notify);

    return messagepackage.Notify.toObject(parsed_notify, {
      longs: String,
      enums: String,
      bytes: String,
    }) as ModuleIM.Core.Notify;
  };

  private ack_parsed_response = (
    cb: (res: messagepackage.IAckResponse) => void
  ) => {
    return (reponse: Uint8Array) => {
      const parsed_response = messagepackage.AckResponse.decode(reponse);

      return cb(
        messagepackage.AckResponse.toObject(parsed_response, {
          longs: String,
          enums: String,
          bytes: String,
        })
      );
    };
  };

  private promise_race = (
    promises: Promise<messagepackage.IAckResponse>[],
    timer: number = 3000
  ): Promise<messagepackage.IAckResponse> => {
    const timeout: Promise<messagepackage.IAckResponse> = new Promise(
      (resolve) => {
        setTimeout(() => {
          resolve({ code: Response.StatusCode.Timeout, msg: "timeout" });
        }, timer);
      }
    );

    return Promise.race([timeout, ...promises]);
  };
}
