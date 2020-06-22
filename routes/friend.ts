const router = require('koa-router')()
const { Friend } = require('common/models')
const { addFriend, delFriend, getAll } = require('common/controllers/friend')

router.prefix('/friend')

/**
 * @description: 好友操作
 * @param {1|2|3} type	好友操作类型	1：添加好友	2：删除好友 3：修改好友相关设置
 * @return: 
 */
router.post('/addFriend', async (ctx, next) => {

	const { type, friendId } = ctx.request.body

	if (!type) {
		ctx.body = {
			code: 400,
			msg: 'type cannot be emptyed'
		}
		return false
	}

	console.log(type)
	console.log(friendId)

	switch (type) {
		case 1:
			// await addFriend(ctx, next)
			const notify = {
				type: 5,
				sender: {
					userId: ctx.userId
				},
				reciver: friendId
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
