const router = require('koa-router')()

router.prefix('/caht')

/**
 * @description: 建群
 * @param {1|2} groupType 1基础群 2超大群	对应groupMax为 200 2000
 * @param {number} groupCreator 群组创建者userId
 * @param {number[]} members 成员userId 数组
 * @return: 
 */
router.post('/createGroup', async (ctx, next) => {
	
})

module.exports = router

export { }
