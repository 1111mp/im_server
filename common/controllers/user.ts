const { User, FriSetting } = require('../models')
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
			code: 500,
			data: `${msg.value} ${msg.message}`
		}
	}
}

/** 获取用户信息
 * 先从redis中获取 再读数据库
 */
const getUserInfo = async (ctx, userId) => {
	let userInfo = await ctx.redis.redis.hgetall(`userInfo::${userId}`)

	if (userInfo && JSON.stringify(userInfo) !== '{}') {
		/** redis中存在数据 */
		return userInfo
	} else {
		try {
			userInfo = await User.findOne({
				attributes: ['id', 'userName', 'avatar', 'email'],
				where: {
					userId: {
						[Op.eq]: userId
					},
				}
			}).toJSON()
			await ctx.redis.redis.hset(`userInfo::${userId}`, userInfo)

			return userInfo
		} catch (err) {
			return {}
		}
	}
}

/** 获取好友信息 */
const getFriendInfo = async (ctx, userId, friendId) => {
	let friendInfo = await ctx.redis.redis.hgetall(`friendInfo::${friendId}`)

	if (friendInfo && JSON.stringify(friendInfo) !== '{}') {
		return friendInfo
	} else {
		try {
			friendInfo = await FriSetting.findOne({
				attributes: ['remark', 'tags', 'astrolabe', 'block'],
				where: {
					userId: {
						[Op.eq]: userId
					},
					friendId: {
						[Op.eq]: friendId
					}
				}
			})

			await ctx.redis.redis.hset(`friendInfo::${friendId}`, friendInfo)

			return friendInfo
		} catch (err) {
			return {}
		}
	}
}

module.exports = {
	queryAll,
	register,
	getUserInfo
}
