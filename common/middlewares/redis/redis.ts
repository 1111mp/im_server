import Redis, { RedisOptions } from "ioredis";
// import Redlock from "redlock";
import { STARREDISKEY, STARRCOUNTKEY } from "../../const";

// const Redis = require("ioredis");
const Redlock = require("redlock");
// const { Op } = require('sequelize/lib/sequelize')
// const { Star } = require('../../models')
// const { v4 } = require('uuid')

const redisConfig: RedisOptions = {
  host: "localhost",
  port: 6379,
  password: "root",
  db: 0,
  // keyPrefix: ''
};

class RedisStore {
  static _instance: RedisStore;
  redis: Redis.Redis;
  redlock: any;
  // keyPrefix: any

  static getInstance(): RedisStore {
    if (!this._instance) {
      this._instance = new RedisStore();
    }
    return this._instance;
  }

  constructor() {
    this.redis = new Redis(redisConfig);
    // this.keyPrefix = v4()
    this.redlock = new Redlock([this.redis], {
      retryDelay: 200, // time in ms
      retryCount: 5,
    });
  }

  async get(key) {
    let data = await this.redis.get(`SESSION:${key}`);
    return JSON.parse(data);
  }

  async set(key, val, maxAge = 60 * 60 * 1000) {
    try {
      await this.redis.set(
        `SESSION:${key}`,
        JSON.stringify(val),
        "EX",
        maxAge / 1000
      );
    } catch (e) {}
  }

  async destroy(key) {
    return await this.redis.del(`SESSION:${key}`);
  }

  /**
   * @description: 点赞 状态为1
   * @param {type} userId 用户id
   * @param {type} dynamicId 动态id
   * @param {0 | 1} status 点赞或者取消点赞
   * @return:
   */
  async saveStarToRedis(userId, dynamicId, status) {
    const key = `${userId}::${dynamicId}`;
    await this.redis.hmset(STARREDISKEY, new Map([[key, status]]));
  }

  /** 从Redis中删除一条点赞数据 */
  async delStarFromRedis(userId, dynamicId) {
    const key = `${userId}::${dynamicId}`;
    await this.redis.hdel(STARREDISKEY, key);
  }

  // /** 该动态的点赞数加1或减1 */
  // async changeStarCount(dynamicId, status: 0 | 1) {
  // 	const redisCount = await this.redis.hmget(STARRCOUNTKEY, [dynamicId])
  // 	let count = redisCount[0]
  // 	if (count === null) {
  // 		count = await Star.count({
  // 			where: {
  // 				dynamicId: {
  // 					[Op.eq]: dynamicId
  // 				}
  // 			}
  // 		})
  // 	}
  // 	count = Number(count)
  // 	status === 1 ? count++ : (count < 1 ? 0 : count--)
  // 	await this.redis.hmset(STARRCOUNTKEY, new Map([[dynamicId, count]]))
  // }

  /** 获取Redis中存储的所有点赞数据 */
  async getStarRedisData() {
    return new Promise((resolve, reject) => {
      this.redis.hgetall(STARREDISKEY, (err, result) => {
        if (err) {
          reject(err);
        }
        resolve(result);
      });
    });
  }

  /** 获取Redis中存储的所有点赞数量 */
  async getStarCountFromReids() {
    return new Promise((resolve, reject) => {
      this.redis.hgetall(STARRCOUNTKEY, (err, result) => {
        if (err) {
          reject(err);
        }
        resolve(result);
      });
    });
  }
}

export default RedisStore.getInstance();
