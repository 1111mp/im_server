const schedule = require('node-schedule')

module.exports = function (callback) {
	return async (ctx, next) => {
		schedule.scheduleJob("* */2 * * *", () => {
			/** 每两小时执行一次 */
			ctx.log4js.conlog({ msg: '每两小时执行一次 开始' })
			callback && callback()
			ctx.log4js.conlog({ msg: '每两小时执行一次 执行结束' })
		})
		next()
	}
}

export { }
