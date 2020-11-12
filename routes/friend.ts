const router = require('koa-router')()
const { v4 } = require('uuid')
const { Friend } = require('../common/models')
const { addFriend, delFriend, getAll, friendOrNot } = require('../common/controllers/friend')
const { getUserInfo } = require('../common/controllers/user')
import { Message } from '../common/const/interface'

router.prefix('/friend')

/**
 * @description: 好友操作
 * @param {1|2|3} type	好友操作类型	1：添加好友	2：删除好友 3：修改好友相关设置
 * @return: 
 */
router.post('/friendHandle', async (ctx, next) => {

	const { type, friendId } = ctx.request.body

	if (!type) {
		ctx.body = {
			code: 400,
			msg: 'type cannot be emptyed'
		}
		return false
	}

	switch (type) {
		case 1:
			const isFriend = await friendOrNot({ userId: ctx.userId, friendId });
			if (isFriend) {
				/** 已经是好友 */
				ctx.body = {
					code: 400,
					msg: "It's already a good friend relationship, don't repeat submit."
				}
				return
			}
			const userInfo = await getUserInfo(ctx, ctx.userId)
			console.log(userInfo)
			const { userName, avatar } = userInfo
			// await addFriend(ctx, next)
			const notify: Message = {
				msgId: v4(),
				type: 4,
				customType: 0,
				sender: {
					userId: ctx.userId,
					avatarUrl: avatar,
					userName: userName
				},
				reciver: friendId,
				status: 1,
				time: new Date().getTime(),
				ext: ''
			};
			(global as any).ChatInstance.sendNotify(friendId, notify)
			return
		case 2:
			await delFriend(ctx, next)
			return
	}

})

	/**
	 * @description: 获取好友列表
	 * @param {type} 
	 * @return: 
	 */
	/
	router.post('/getAll', getAll)

module.exports = router

export { }
