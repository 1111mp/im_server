import RedisStore from "../middlewares/redis/redis";
import {
  IAnyObject,
  Message,
  Notify,
  AckResponse as AckResponseType,
} from "../const/interface";
import { getNotifyKey } from "../const";
import Redis from "ioredis";

const { messagepackage } = require("../../proto/proto");
const {
  Message: ProtoMessage,
  Notify: ProtoNotify,
  AckResponse,
} = messagepackage;

export function setMessageToProto(msg: Message): Buffer {
  const message = ProtoMessage.create(msg);
  return ProtoMessage.encode(message).finish();
}

export function getMessagefromProto(buffer: Buffer): Message {
  const decodedMessage = ProtoMessage.decode(buffer);
  return ProtoMessage.toObject(decodedMessage, {
    longs: String,
    enums: String,
    bytes: String,
  });
}

export function setNotifyToProto(notify: Notify): Buffer {
  const message = ProtoNotify.create(notify);
  return ProtoNotify.encode(message).finish();
}

export function getNotifyFromProto(buffer: Buffer): Notify {
  const decodedMessage = ProtoNotify.decode(buffer);
  return ProtoNotify.toObject(decodedMessage, {
    longs: String,
    enums: String,
    bytes: String,
  });
}

export function setAckResponseToProto(ack: AckResponseType): Buffer {
  const message = AckResponse.create(ack);
  return AckResponse.encode(message).finish();
}

export function getAckResponseFromProto(buffer: Buffer): AckResponseType {
  const decodedMessage = AckResponse.decode(buffer);
  return AckResponse.toObject(decodedMessage, {
    longs: String,
    enums: String,
    bytes: String,
  });
}

export function racePromise(
  promise: Promise<AckResponseType>,
  timer: number = 1000
): Promise<"timedout" | AckResponseType> {
  let timeout: Promise<"timedout"> = new Promise((resolve, reject) => {
    setTimeout(() => {
      resolve("timedout");
    }, timer);
  });

  return Promise.race([promise, timeout]);
}

export async function delRedisKey(key) {
  await RedisStore.redis.del(key);
}

/** 判断key 在redis中是否存在 键存在，返回1，否则返回0 */
export async function exists(key) {
  return await RedisStore.redis.exists(key);
}

/** key有两种可能 `${sender}::${reciver}` or `${reciver}::${sender}` 所以需要进行处理 */
// export async function getMsgList(offline = false, sender, reciver?: any) {
//   let res: any[];

//   /** 获取离线消息列表 */
//   if (offline) {
//     res = await RedisStore.redis.lrange(`offline::${sender}`, 0, -1);
//   } else {
//     res = await RedisStore.redis.lrange(`to::${sender}`, 0, -1);
//     // if (await exists(`${sender}::${reciver}`)) {
//     //   res = await RedisStore.redis.lrange(`${sender}::${reciver}`, 0, -1);
//     // } else if (await exists(`${reciver}::${sender}`)) {
//     //   res = await RedisStore.redis.lrange(`${reciver}::${sender}`, 0, -1);
//     // } else {
//     //   res = [];
//     // }
//   }

//   return res;
// }

/** 在线时的消息 push到 redis的list中去 */
export async function msgToRedis(reciver, msg) {
  try {
    await RedisStore.redis.rpush(`to::${reciver}`, JSON.stringify(msg));
  } catch (error) {
    throw new Error("push msg to redis error");
  }
}

/**
 * @description: 将用户的离线消息push到该用户的离线消息列表中去
 *  redis 的 key ===> `offline::${reciver}`
 *  list 类型储存
 * @param {*} sender  发送者 userId
 * @param {*} reciver 接受者 userId
 * @param {*} msg 消息
 * @return {*}
 */
export async function offlineMsgToRedis(sender, reciver, msg) {
  try {
    await RedisStore.redis.lpush(`offline::${reciver}`, JSON.stringify(msg));
  } catch (error) {
    throw new Error("push msg to redis error");
  }
}

/**
 * @description:  在线时的通知 push到 redis的list中去
 * @param {number} reciver  接受者userId
 * @param {Notify} notify 通知消息
 * @return {*}
 */
export async function notifyToRedis(reciver: number, notify: Notify) {
  await RedisStore.redis.rpush(getNotifyKey(reciver), JSON.stringify(notify));
}

export async function offlineNotifyToRedis(reciver: number, notify: Notify) {
  await RedisStore.redis.lpush(
    getNotifyKey(reciver, true),
    JSON.stringify(notify)
  );
}

/**
 * @description: 获取指定用户的离线消息的数量信息
 * @param {number} userId 用户 userId
 * @return {*}
 */
export async function unReadCountsFromRedis(userId: number): Promise<number> {
  try {
    return await RedisStore.redis.llen(`offline::${userId}`);
  } catch (error) {
    return 0;
  }
}

export async function offlineMsgsFromRedis({
  userId,
  pageNo,
  pageSize,
}: {
  userId: number;
  pageNo: number;
  pageSize: number;
}) {}

export function updateMsgStatus() {}

export function pushRedisRace(promise, timer = 1000) {
  let timeout = new Promise((resolve, reject) => {
    setTimeout(() => {
      resolve({ code: 408 });
    }, timer);
  });

  return Promise.race([promise, timeout]);
}

/** 查看通知是否已经存在redis缓存中 */
export async function getNotifyRedisInfo(
  redis: Redis.Redis,
  notify: Notify
): Promise<number> {
  const { sender, reciver, type } = notify;

  const notifys = await redis.lrange(getNotifyKey(reciver), 0, -1);

  return (notifys as any[]).findIndex(
    (item: Notify) =>
      item.reciver === reciver && item.sender === sender && item.type === type
  );
}

export async function getNotifyByMsgIdFromRedis(
  redis: Redis.Redis,
  userId: number,
  msgId: string
): Promise<{ notify: Notify; index: number }> {
  const notifys = await redis.lrange(getNotifyKey(userId), 0, -1);
  let index;

  const notify = (notifys as any[]).find((notify, i) => {
    index = i;
    return notify.msgId === msgId;
  });

  return {
    notify,
    index,
  };
}

export async function delNtyByValue(
  redis: Redis.Redis,
  userId: number,
  notify: string
) {
  await redis.lrem(getNotifyKey(userId), 0, notify);
}
