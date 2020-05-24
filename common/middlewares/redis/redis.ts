const Redis = require("ioredis")
// const { v4 } = require('uuid')

const redisConfig = {
	host: 'localhost',
	port: '6379',
	password: 'root',
	db: 0,
	// keyPrefix: ''
}

class RedisStore {
	static _instance: RedisStore
	redis: any
	// keyPrefix: any

	static getInstance(): RedisStore {
		if (!this._instance) {
			this._instance = new RedisStore()
		}
		return this._instance
	}

	constructor() {
		this.redis = new Redis(redisConfig)
		// this.keyPrefix = v4()
	}

	async get(key) {
		let data = await this.redis.get(`SESSION:${key}`)
		return JSON.parse(data)
	}

	async set(key, val, maxAge = 60 * 60 * 1000) {
		try {
			await this.redis.set(`SESSION:${key}`, JSON.stringify(val), 'EX', maxAge / 1000)
		} catch (e) { }
	}

	async destroy(key) {
		return await this.redis.del(`SESSION:${key}`)
	}
}

module.exports = RedisStore.getInstance()

export { }
