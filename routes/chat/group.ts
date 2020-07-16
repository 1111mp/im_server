const router = require('koa-router')()
const db = require('../../common/models')
const { ChatGroup, GroupMember } = require('../../common/models')

router.prefix('/chat')

/**
 * @description: 建群
 * @param {1|2} groupType 1基础群 2超大群	对应groupMax为 200 2000
 * @param {number} groupCreator 群组创建者userId
 * @param {number[]} members 成员userId 数组
 * @return: 
 */
router.post('/createGroup', async (ctx, next) => {
	const { groupType, members } = ctx.request.body
	if (!groupType || !members) {
		ctx.body = {
			code: 400,
			msg: 'groupType or members cannot be emptyed'
		}
		return false
	}

	try {
		let groupInfo: any
		await db.sequelize.transaction(t => {
			return ChatGroup.create({
				groupType,
				groupMax: groupType === 1 ? 200 : 2000,
				groupCreator: ctx.userId
			}, { transaction: t })
				.then(group => {
					groupInfo = group
					return Promise.all(
						members.map(member => {
							return GroupMember.create({ groupId: group.id, userId: member }, { transaction: t })
						})
					)
				})
		})
		ctx.body = {
			code: 200,
			data: groupInfo
		}
	} catch (err) {
		const msg = err.errors[0]
		ctx.body = {
			code: 400,
			data: `${msg.value} ${msg.message}`
		}
	}

})

module.exports = router

export { }
