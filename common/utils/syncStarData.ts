import RedisStore from "../middlewares/redis/redis";
import logs from "../middlewares/logger";
import {
  findOne,
  createOne,
  updateStatus,
  getCount,
} from "../controllers/star";
import { STARREDISKEY } from "../const";

const ttl = 10000;
const lockKey = "lockStarData";

async function starIsinDb(userId, dynamicId) {
  const data = await findOne({ userId, dynamicId });
  if (data == null) {
    return false;
  } else {
    return true;
  }
}

/**
 * @description: 将redis中的点赞数据同步到数据库中
 * @param {type}
 * @return:
 */
async function syncStarFromRedisTodb() {
  try {
    let starRedisData = await RedisStore.getStarRedisData();

    starRedisData &&
      (await Promise.all(
        Object.keys(starRedisData).map(async (key) => {
          const lock = await RedisStore.redlock.lock(key, ttl);

          const keyArr = key.split("::");
          const userId = Number(keyArr[0]);
          const dynamicId = Number(keyArr[1]);
          const status = Number(starRedisData[key]) as 0 | 1;

          const flag = await starIsinDb(userId, dynamicId);

          try {
            if (flag) {
              /** 数据库中存在记录 修改状态 */
              await updateStatus({ userId, dynamicId, status });
            } else {
              /** 数据库不存在记录 直接存 */
              await createOne({ userId, dynamicId, status });
            }
          } catch (err) {
            /** 这一条数据同步失败 */
            logs.conlog({ msg: `${key}: ${status} 同步失败` });
            lock.unlock();
            throw err;
          }

          /** 同步成功之后 从redis删除改数据 */
          RedisStore.redis.hdel(STARREDISKEY, key);
          lock.unlock();
        })
      ));
  } catch (err) {
    logs.conlog({
      position: "syncStarFromRedisTodb",
      err: JSON.stringify(err),
    });
  }
}

async function syncStarCountToDb() {
  let starRedisCounts = await RedisStore.getStarCountFromReids();

  try {
    starRedisCounts &&
      (await Promise.all(
        Object.keys(starRedisCounts).map(async (key) => {
          const lock = await RedisStore.redlock.lock(`dynamicId_${key}`, ttl);

          const dynamicId = Number(key);
          const redisCount = isNaN(Number(starRedisCounts[key]))
            ? 0
            : Number(starRedisCounts[key]);

          const dbCount = await getCount(dynamicId);

          if (redisCount === dbCount) {
            /** 数据库中的数量的redis中的点赞数量一致 */
            logs.conlog({
              msg: "本次同步结果一致",
              detail: `dynamicId：${key} redis中的点赞数量：${redisCount} db中查询到的数量：${dbCount}`,
            });
          } else {
            logs.conlog({
              msg: "本次同步出现错误",
              detail: `dynamicId：${key} redis中的点赞数量：${redisCount} db中查询到的数量：${dbCount}`,
            });
          }

          lock.unlock();
        })
      ));
  } catch (err) {
    logs.conlog({ position: "syncStarCountToDb", err: JSON.stringify(err) });
  }

  logs.conlog({
    msg: "每两小时执行一次 执行=======================>>>>>>>>>>>>>>>>>>>>结束",
  });
}

/** 定时将redis中的点赞数据同步到数据库中 */
export default async function () {
  try {
    /** 整个同步操作加锁的话 过期时间不好确定 所以给每个子任务加锁 */
    // const lock = await RedisStore.redlock.lock(lockKey, ttl);
    await syncStarFromRedisTodb();

    await syncStarCountToDb();
  } catch (err) {
    logs.conlog({ position: "入口", err: JSON.stringify(err) });
  }
}
