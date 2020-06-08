const db, { Friend, User, FriSetting } = require('../models')
const { Op } = require('sequelize/lib/sequelize')

/**
 * @description: 添加好友
 * @param {number} friendId	好友的userId
 * @return: 
 */
async function addFriend(ctx, next) {
	const { friendId } = ctx.request.body
	if (!friendId) {
		ctx.body = {
			code: 400,
			msg: 'friendId cannot be emptyed'
		}
		return false
	}

	try {

		await db.sequelize.transaction(t => {
			return Friend.create({ userId: ctx.userId, friendId }, { transaction: t })
				.then(friend => {
					return FriSetting.create({ userId: ctx.userId, friendId }, { transaction: t })
				})
		})

		ctx.body = {
			code: 200,
			msg: 'successed'
		}

	} catch (err) {

		const msg = err.errors[0]
		ctx.body = {
			code: 400,
			data: `${msg.value} ${msg.message}`
		}

	}
}

/**
 * @description: 删除好友
 * @param {number} friendId	好友的userId
 * @return: 
 */
async function delFriend(ctx, next) {
	const { friendId } = ctx.request.body
	const userId = ctx.userId

	if (!friendId) {
		ctx.body = {
			code: 400,
			msg: 'friendId cannot be emptyed'
		}
		return false
	}

	try {

		await Friend.destroy({
			where: {
				[Op.or]: [
					{
						userId: {
							[Op.eq]: userId
						},
						friendId: {
							[Op.eq]: friendId
						}
					},
					{
						userId: {
							[Op.eq]: friendId
						},
						friendId: {
							[Op.eq]: userId
						}
					}
				]
			}
		})

		ctx.body = {
			code: 200,
			msg: 'delete success'
		}

	} catch (err) {
		const msg = err.errors[0]
		ctx.body = {
			code: 400,
			data: `${msg.value} ${msg.message}`
		}
	}
}

async function friendOrNot(params: { userId: number; friendId: number; }) {



}

async function getAll(ctx, next) {
	const userId = ctx.userId

	try {

		let { rows: friendIds, count: totalCount } = await Friend.findAndCountAll({
			attributes: ['userId', 'friendId'],
			where: {
				[Op.or]: [
					{
						userId: {
							[Op.eq]: userId
						}
					},
					{
						friendId: {
							[Op.eq]: userId
						}
					}
				]
			}
		})

		let friends: any[] = await Promise.all(
			friendIds.map(async (friend) => {

				let friendId,
					friendInfo
				friend = friend.toJSON()

				if (friend.userId === userId) {
					friendId = friend.friendId
				} else {
					friendId = friend.userId
				}

				let baseInfo = await User.findOne({
					attributes: { exclude: ['pwd', 'updateAt'] },
					where: {
						id: {
							[Op.eq]: friendId
						}
					}
				}).toJSON()

				let settings = await FriSetting.findOne({
					attributes: { exclude: ['id', 'userId', 'friendId', , 'createdAt', 'updateAt'] },
					where: {
						userId: {
							[Op.eq]: userId
						},
						friendId: {
							[Op.eq]: friendId
						}
					}
				}).toJSON()

				friendInfo = {
					...baseInfo,
					...settings
				}

				return friendInfo

			})
		)

		ctx.body = {
			code: 200,
			data: {
				totalCount,
				friends
			}
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
	addFriend,
	delFriend,
	getAll
}

export { }
