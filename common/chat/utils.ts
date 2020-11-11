import { IAnyObject } from "../const/interface";

const RedisStore = require("../middlewares/redis/redis");

export async function delRedisKey(key) {
  await RedisStore.redis.del(key);
}

/** 判断key 在redis中是否存在 键存在，返回1，否则返回0 */
export async function exists(key) {
  return await RedisStore.redis.exists(key);
}

/** key有两种可能 `${sender}::${reciver}` or `${reciver}::${sender}` 所以需要进行处理 */
export async function getMsgList(offline = false, sender, reciver?: any) {
  let res: any[];

  /** 获取离线消息列表 */
  if (offline) {
    res = await RedisStore.redis.lrange(`offline::${sender}`, 0, -1);
  } else {
    res = await RedisStore.redis.lrange(`to::${sender}`, 0, -1);
    // if (await exists(`${sender}::${reciver}`)) {
    //   res = await RedisStore.redis.lrange(`${sender}::${reciver}`, 0, -1);
    // } else if (await exists(`${reciver}::${sender}`)) {
    //   res = await RedisStore.redis.lrange(`${reciver}::${sender}`, 0, -1);
    // } else {
    //   res = [];
    // }
  }

  return res;
}

/** 在线时的消息 push到 redis的list中去 a和b共同的msgList */
export async function pushOnlineMsg(sender, reciver, msg) {
  await RedisStore.redis.rpush(`to::${reciver}`, JSON.stringify(msg));
  // if (await exists(`${sender}::${reciver}`)) {
  //   await RedisStore.redis.rpush(`${sender}::${reciver}`, JSON.stringify(msg));
  // } else if (await exists(`${reciver}::${sender}`)) {
  //   await RedisStore.redis.rpush(`${reciver}::${sender}`, JSON.stringify(msg));
  // } else {
  //   await RedisStore.redis.rpush(`${sender}::${reciver}`, JSON.stringify(msg));
  // }
}

/**
 * 将用户的离线消息push到该用户的离线消息列表中去 key ===> `offline::${reciver}`
 * 同时也push到 a和b共同的msgList中去
 */
export async function pushOfflineMsg(sender, reciver, msg) {
  return new Promise(async (resolve, reject) => {
    // let key

    // if (await exists(`${sender}::${reciver}`)) {
    // 	key = `${sender}::${reciver}`
    // } else if (await exists(`${reciver}::${sender}`)) {
    // 	key = `${reciver}::${sender}`
    // } else {
    // 	key = `${sender}::${reciver}`
    // }
    let offlineMsgs = RedisStore.redis.lrange(`offline::${reciver}`, 0, -1);
    offlineMsgs = JSON.parse(offlineMsgs || "{}");

    if (sender in offlineMsgs) {
      /** 存在 */
      offlineMsgs[sender].push(msg);
    } else {
      offlineMsgs[sender] = [{ ...msg }];
    }

    await RedisStore.redis
      .multi()
      .rpush(`to::${reciver}`, JSON.stringify(msg))
      .rpush(`offline::${reciver}`, JSON.stringify(offlineMsgs))
      .exec((err, results) => {
        if (err) {
          reject(new Error("push msg to redis error"));
        }
        resolve("successed");
      });
  });
}

export function updateMsgStatus() {}

export function pushRedisRace(promise, timer = 1000) {
  let timeout = new Promise((resolve, reject) => {
    setTimeout(() => {
      resolve({ code: 408 });
    }, timer);
  });

  return Promise.race([promise, timeout]);
}
