import { count } from "console";
import { IAnyObject } from "../const/interface";

const RedisStore = require("../middlewares/redis/redis");

export function racePromise(
  promise: Promise<any>,
  timer: number = 1000
): Promise<any> {
  let timeout = new Promise((resolve, reject) => {
    setTimeout(() => {
      resolve({ code: 408 });
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

/** 在线时的消息 push到 redis的list中去 a和b共同的msgList */
export async function onlineMsgToRedis(reciver, msg) {
  await RedisStore.redis.rpush(`to::${reciver}`, JSON.stringify(msg));
}

/**
 * @description: 将用户的离线消息push到该用户的离线消息列表中去
 *  redis 的 key ===> `offline::${reciver}`
 *  hash 类型储存 对应的发送者 userId 为 key, msgList为value
 * @param {*} sender  发送者 userId
 * @param {*} reciver 接受者 userId
 * @param {*} msg 消息
 * @return {*}
 */
export async function offlineMsgToRedis(sender, reciver, msg) {
  return new Promise(async (resolve, reject) => {
    try {
      const key = `offline::${reciver}`;

      let offlineMsgs;

      if (await RedisStore.redis.hexists(key, `${sender}`)) {
        /** 存在 */
        let msgInfo = await RedisStore.redis.hget(key, `${sender}`);
        const { count, msgs } = JSON.parse(msgInfo);
        offlineMsgs = {
          count: ++(count as number),
          msgs: [...msgs, { ...msg }],
        };
      } else {
        /** 不存在 */
        offlineMsgs = { count: 1, msgs: [{ ...msg }] };
      }

      RedisStore.redis.hset(key, `${sender}`, JSON.stringify(offlineMsgs));

      resolve(200);
    } catch (error) {
      reject("push msg to redis error");
    }
  });
}

/**
 * @description: 获取指定用户的离线消息的数量信息
 * @param {number} userId 用户 userId
 * @return {*}
 *  {
 *    userId1: 3,
 *    userId2: 1,
 *    userId3: 99,
 *    group1: 33,
 *    ...
 *  }
 */
export async function unReadCountsFromRedis(userId: number) {
  const keys: string[] = await RedisStore.redis.hkeys(`offline::${userId}`);

  if (keys && keys.length) {
    return keys.reduce(async (acc: any, cur: string, idx: number) => {
      let msgInfo: any = await RedisStore.redis.hget(`offline::${userId}`, cur);
      const { count, msgs } = JSON.parse(msgInfo);
      return {
        ...acc,
        [Number(cur)]: {
          count,
          msg: { ...msgs[(msgs as any[]).length - 1] },
        },
      };
    }, {});
  }
  return null;
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
