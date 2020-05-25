const router = require('koa-router')()
const { Op } = require('sequelize/lib/sequelize')
const { Dynamic } = require('../common/models')

router.prefix('/dynamic')

/**
 * @description: 查询用户发表的所有动态
 * @param {number} userId 用户id
 * @param {number} pageNo 页码
 * @param {number} pageSize 分页大小
 * @return: 
 */
router.post('/queryUserAll', async (ctx, next) => {
  const { pageNo, pageSize } = ctx.request.body
  const { userId } = ctx

  if (!userId) {
    ctx.throw(401, 'Authentication Error')
    return false
  }

  if (!pageNo || !pageSize) {
    ctx.body = {
      code: 400,
      msg: 'pageNo or pageSize cannot be emptyed!'
    }
    return false
  }

  try {
    let { rows: dynamics, count: totalCount } = await Dynamic.findAndCountAll({
      where: {
        userId: {
          [Op.eq]: userId
        }
      },
      offset: (pageNo - 1) * pageSize,
      limit: pageSize,
      order: [
        ['createdAt', 'DESC']
      ]
    })

    ctx.body = {
      code: 200,
      totalCount,
      data: dynamics
    }

  } catch (err) {

    ctx.throw(500, err)

  }

})

/**
 * @description: 发布动态
 * @param {string} content 动态的内容
 * @param {strin[]} images 图片url
 * @return: 
 */
router.post('/publish', async (ctx, next) => {
  const params = ctx.request.body
  params.userId = ctx.userId

  if (!params.userId) {
    ctx.throw(401, 'Authentication Error')
    return false
  }

  if (!params.content) {
    ctx.body = {
      code: 400,
      msg: 'content cannot be emptyed!'
    }
    return false
  }

  try {

    await Dynamic.create(params)

    ctx.body = {
      code: 200,
      data: 'publish dynamic successed'
    }

  } catch (err) {
    
    const msg = err.errors[0]
    ctx.body = {
      code: 400,
      data: `${msg.value} ${msg.message}`
    }

  }
})

/**
 * @description: 点赞
 * @param {number} dynamicId 动态id 
 * @return: 
 */
router.post('/star', async (ctx, next) => {
  const { dynamicId } = ctx.request.body

  if (!dynamicId) {
    ctx.body = {
      code: 400,
      msg: 'dynamicId cannot be emptyed!'
    }
    return false
  }


})

module.exports = router

export { }
