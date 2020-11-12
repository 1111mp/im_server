const { secretOrPrivateKey } = require("../../config");
const jwt = require("jsonwebtoken");
const RedisStore = require("../middlewares/redis/redis");
const _ = require("lodash");

import { Message, IAnyObject, InvokeData } from "../const/interface";
import {
  racePromise,
  unReadCountsFromRedis,
  onlineMsgToRedis,
  offlineMsgToRedis,
  delRedisKey,
  pushRedisRace,
} from "./utils";

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
      if (socket.handshake.query && socket.handshake.query.token) {
        const realToken = await RedisStore.get(socket.handshake.query.token);
        jwt.verify(realToken, secretOrPrivateKey, function (err, decoded) {
          if (err) return next(new Error("Authentication error"));
          socket.decoded = decoded;
          next();
        });
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
    /** 事件的初始化 */
    METHODS.forEach((method) => {
      socket.on(method, (data: any, callback: any) => {
        this[method](socket, data, callback);
      });
    });

    /** 连接成功之后的一系列操作。。。推送离线消息等 */
    this.initOperate(socket);
  };

  initOperate = async (socket: Socket) => {
    console.log(socket.decoded);
    const { userId } = socket.decoded;

    /** 在线用户 记录 */
    this.userList[userId] = {
      ...this.userList[userId],
      socketId: socket.id,
      socket,
    };

    /** 连接（相当于登录成功）之后，推送离线消息、通知等。。。 */
    const msgsInfo = await unReadCountsFromRedis(userId);

    console.log(msgsInfo);

    if (msgsInfo) {
      const promise = new Promise((resolve) => {
        socket.emit("offline-msgs-counts", msgsInfo, (result) => {
          resolve(result);
        });
      });
      const result = await racePromise(promise);
      if (result === 200) {
        /** 发送成功 */
      } else {
        /** 发送失败 */
      }
    }
  };

  send() {}

  invoke = (socket: any, data: any, callback: any) => {
    data = JSON.parse(data);
    const { type } = data;

    switch (type) {
      // case "login":
      //   this.login(socket, data, callback);
      //   return;
      case "send-msg":
        /** 发送消息 */
        this.sendMsg(socket, data, callback);
        return;
      case "get-offline-msgs":
        /** 获取离线消息 */
        this.getOfflineMsgs(socket, data, callback);
        return;
    }
  };

  // login = async (socket: any, data: any, callback: any) => {
  //   const { args } = data;
  //   const { userId, socketId } = args;

  //   this.userList[userId] = {
  //     ...this.userList[userId],
  //     socketId,
  //     socket,
  //   };

  //   callback({ code: 200, msg: "login success" });

  //   /** 用户登录成功之后 将该用户的所有离线消息都推送过去 */
  //   let offlineMsgs = await unReadCountsFromRedis(userId);

  //   if (offlineMsgs && offlineMsgs.length) {
  //     /** 有离线消息 一次性推送给客户端 可做性能优化 分页拉取 */
  //     await socket.emit("offlineMsgs", offlineMsgs, (data) => {
  //       console.log(data.lastMsgId);
  //       if (data && data.code === 200) {
  //         // delRedisKey(`offline::${userId}`)
  //       }
  //     });
  //   }
  // };

  sendMsg = async (socket: Socket, data: any, callback: any) => {
    const args: Message = data.args;
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

          let promise = new Promise((resolve, reject) => {
            this.userList[reciver].socket.emit("receiveMsg", msg, (data) => {
              resolve(data);
            });
          });

          let res = await racePromise(promise);

          if (res.code === 200) {
            msg = {
              ...msg,
              status: 2,
            };
            await onlineMsgToRedis(reciver, msg);

            callback({ code: 200, msg: "success" });
            /** 将msg push到redis消息列表中 */
          } else {
            /** 将msg push到redis 离线消息列表中 */
            offlineMsgToRedis(sender.userId, reciver, msg);

            callback({ code: 403, msg: "error" });
          }
        } catch (err) {
          console.log(err);
          /** 将msg push到redis 离线消息列表中 */
          offlineMsgToRedis(sender.userId, reciver, msg);
          callback({ code: 403, msg: "error" });
        }
      } else {
        /** 接收者离线 将消息放入该用户的离线消息list中 */
        msg = {
          ...msg,
          status: 0,
        };

        console.log(reciver);
        let res = await offlineMsgToRedis(sender.userId, reciver, msg);
        console.log(res);
        if (res === 200) {
          callback({ code: 200, msg: "success" });
        } else {
          callback({ code: 500, msg: res });
        }
      }
    } else if (sessionType === 1) {
      /** 群聊 reciver为接收的groupId */
    }
  };

  sendNotify = (userId, notify: IAnyObject) => {
    if (this.userList[userId]) {
      /** 在线 */
      this.userList[userId].socket.emit("notify", notify, (data) => {
        console.log(data);
      });
    } else {
      /** 离线 */
    }
  };

  /** 获取离线消息 分页 */
  getOfflineMsgs = (socket: Socket, data: any, callback: any) => {
    console.log(data);
		const { pageNo, pageSize } = data.args;
		
		

    callback({ code: 200 });
  };

  disconnect = (socket: any) => {
    /** 断开连接之后 将用户从在线user列表移除 */
    this.userList = _.omitBy(
      this.userList,
      (val) => val.socketId === socket.id
    );
  };
}

module.exports = function (server) {
  (global as any).ChatInstance = Chat.getInstance(server);
};

export {};
