const User = require('../models/user')
const { Op } = require('sequelize/lib/sequelize')

/** 获取所有用户 */
const queryAll = async (ctx) => {
	const data = await User.findAll()
	ctx.body = {
		code: 200,
		data
	}
}

/** 注册用户 */
const register = async (ctx) => {
	const params = ctx.request.body

	if (!params.username || !params.pwd) {
		ctx.body = {
			code: 400,
			msg: 'username or pwd cannot be repeated'
		}
		return false
	}

	try {
		await User.create(params)
		ctx.body = {
			code: 200,
			data: 'register successed'
		}
	} catch (err) {
		const msg = err.errors[0]
		ctx.body = {
			code: 400,
			data: `${msg.value} ${msg.message}`
		}
	}
}

module.exports = {
	queryAll,
	register
}
