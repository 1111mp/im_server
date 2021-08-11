import RedisStore from "../middlewares/redis/redis";
import {
  Message,
  IAnyObject,
  InvokeData,
  Notify,
  AckResponse,
} from "../const/interface";
import { omitBy } from "lodash";
import jwt from "jsonwebtoken";

import { getUserInfoByUserId } from "../controllers/user";
import {
  racePromise,
  unReadCountsFromRedis,
  msgToRedis,
  offlineMsgToRedis,
  delRedisKey,
  pushRedisRace,
  getMessagefromProto,
  setNotifyToProto,
  getAckResponseFromProto,
  notifyToRedis,
  offlineNotifyToRedis,
} from "./utils";
import { Config } from "../../config";
import { IMNOTIFY } from "./constants";

export type Socket = {
  decoded: IAnyObject;
} & SocketIO.Socket;

const METHODS: string[] = ["invoke", "disconnect"];

class Chat {
  static _instance: Chat;
  private socket: SocketIO.Server;
  private userList: IAnyObject;

  static getInstance(server): Chat {
    if (!Chat._instance) {
      Chat._instance = new Chat(server);
    }
    return Chat._instance;
  }

  constructor(server) {
    /** init一次 */
    this.userList = new Object();
    this.socket = require("socket.io")(server);

    /** https://stackoverflow.com/questions/36788831/authenticating-socket-io-connections-using-jwt */
    this.socket.use(async (socket: Socket, next) => {
      if (socket.handshake.headers && socket.handshake.headers.token) {
        const realToken = await RedisStore.get(socket.handshake.headers.token);
        jwt.verify(
          realToken,
          Config.secretOrPrivateKey,
          function (err, decoded) {
            if (err) return next(new Error("Authentication error"));
            socket.decoded = decoded;
            next();
          }
        );
      } else {
        next(new Error("Authentication error"));
      }
    });

    this.socket.on("connection", this.connection);

    this.socket.on("error", (err) => {
      console.log(err);
    });
  }

  connection = (socket: Socket) => {
    const { userId } = socket.decoded;

    /** 在线用户 记录 */
    this.userList[userId] = {
      ...this.userList[userId],
      socketId: socket.id,
      socket,
    };

    /** 事件的初始化 */
    METHODS.forEach((method) => {
      socket.on(method, (data: any, callback: any) => {
        this[method](socket, data, callback);
      });
    });

    /** 连接成功之后的一系列操作。。。推送离线消息等 */
    this.initOperate(socket, userId);
  };

  initOperate = async (socket: Socket, userId: number) => {
    /** 连接（相当于登录成功）之后，推送离线消息、通知等。。。 */
    try {
      const counts = await unReadCountsFromRedis(userId);

      console.log(counts);

      const promise: Promise<AckResponse> = new Promise((resolve) => {
        socket.emit("offline-msg-counts", counts, (data: Buffer) => {
          const ack: AckResponse = getAckResponseFromProto(data);
          resolve(ack);
        });
      });

      const result = await racePromise(promise);

      if (result !== "timedout" && result.code === 200) {
        /** 发送成功 */
      } else {
        /** 发送失败 */
      }
    } catch (error) {
      console.log(error);
    }
  };

  send() {}

  invoke = (socket: any, data: any, callback: any) => {
    // data = JSON.parse(data);
    const { type } = data;

    switch (type) {
      // case "login":
      //   this.login(socket, data, callback);
      //   return;
      case "send-msg":
        /** 发送消息 */
        this.sendMsg(socket, data, callback);
        return;
      // case "get-offline-msgs":
      //   /** 获取离线消息 */
      //   this.getOfflineMsgs(socket, data, callback);
      //   return;
    }
  };

  sendMsg = async (socket: Socket, data: any, callback: any) => {
    console.log(data.args);
    const args: Message = getMessagefromProto(data.args);
    console.log(args);
    const { sessionType } = args;
    if (sessionType === 0) {
      const { reciver, sender } = args;
      let msg: Message = {
        ...args,
        time: new Date().getTime(),
      };

      /** 单聊 reciver为接收者的userId */
      if (this.userList[reciver]) {
        /** 接收者在线 */
        try {
          msg = {
            ...msg,
            status: 1,
          };

          let promise: Promise<AckResponse> = new Promise((resolve, reject) => {
            this.userList[reciver].socket.emit(
              "receiveMsg",
              msg,
              (data: Buffer) => {
                const ack: AckResponse = getAckResponseFromProto(data);
                resolve(ack);
              }
            );
          });

          let res = await racePromise(promise);

          if (res !== "timedout" && res.code === 200) {
            msg = {
              ...msg,
              status: 2,
            };

            /** 将msg push到redis消息列表中 */
            await msgToRedis(reciver, msg);
          } else {
            /** 将msg push到redis 离线消息列表中 */
            offlineMsgToRedis(sender, reciver, msg);
          }

          callback({ code: 200, msg: "success" });
        } catch (error) {
          const err = error.errors[0];
          callback({ code: 500, msg: `${err.value} ${err.message}` });
        }
      } else {
        /** 接收者离线 将消息放入该用户的离线消息list中 */
        msg = {
          ...msg,
          status: 0,
        };

        try {
          await offlineMsgToRedis(sender, reciver, msg);

          callback({ code: 200, msg: "success" });
        } catch (error) {
          const err = error.errors[0];
          callback({ code: 500, msg: `${err.value} ${err.message}` });
        }
      }
    } else if (sessionType === 1) {
      /** 群聊 reciver为接收的groupId */
    }
  };

  /** 发送通知消息
   * 0 初始状态 1 已读 2 同意 3 拒绝
   * 通知消息 redis缓存如何入库：
   * 状态为 status<2 的通知（未同意拒绝的）不会入库 一直存在redis中
   * 然后在用户操作（同意拒绝）时，改变status 入库 然后从redis中删除该通知
   */
  sendNotify = async (
    ctx,
    reciver,
    notify: Notify,
    cache: boolean = true
  ): Promise<"successed" | "failed"> => {
    try {
      // 判断是否存在此类型通知 比如：A 重复发起添加 B 为好友

      if (this.userList[reciver]) {
        /** 在线 */
        const senderInfo = await getUserInfoByUserId(
          ctx.redis.redis,
          ctx.userId
        );

        const notifyMsg = {
          ...notify,
          senderInfo: JSON.stringify(senderInfo),
        };
        // 序列化
        const buffer = setNotifyToProto(notifyMsg);

        const promise: Promise<AckResponse> = new Promise((resolve) => {
          this.userList[reciver].socket.emit(
            IMNOTIFY,
            buffer,
            (data: Buffer) => {
              const ack: AckResponse = getAckResponseFromProto(data);
              resolve(ack);
            }
          );
        });

        const result = await racePromise(promise, 3000);

        /** 先推送 还是先缓存？？？ */

        if (result === "timedout" || result.code !== 200) {
          // 失败之后 将通知存到reciver的离线通知redis list中 或其他操作
          await offlineNotifyToRedis(reciver, notify);
        }
      } else {
        /** 离线 */
        // 保存到该用户的离线通知list
        await offlineNotifyToRedis(reciver, notify);
      }

      // 将通知 存到redis中
      cache && (await notifyToRedis(reciver, notify));

      return "successed";
    } catch (error) {
      return "failed";
    }
  };

  /** 获取离线消息 分页 */
  // getOfflineMsgs = (socket: Socket, data: any, callback: any) => {
  //   console.log(data);
  //   const { pageNo, pageSize } = data.args;

  //   callback({ code: 200 });
  // };

  disconnect = (socket: any) => {
    /** 断开连接之后 将用户从在线user列表移除 */
    this.userList = omitBy(this.userList, (val) => val.socketId === socket.id);
  };
}

export default function (server) {
  (global as any).ChatInstance = Chat.getInstance(server);
}
