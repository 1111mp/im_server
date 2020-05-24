const RedisStore = require('./redis')

module.exports = function () {
	return async (ctx, next) => {
		ctx.redis = RedisStore
		await next()
	}
}

export { }
