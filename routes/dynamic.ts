const router = require('koa-router')()
const { Op } = require('sequelize/lib/sequelize')
const Dynamic = require('../common/models/dynamic')

router.prefix('/dynamic')


router.post('/queryUserAll', async (ctx, next) => {
  const { userId, pageNo, pageSize } = ctx.request.body

  if (!userId) {
    ctx.body = {
      code: 400,
      msg: 'userId cannot be emptyed!'
    }
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
 * @param {number} userId 用户id
 * @param {string} content 动态的内容
 * @return: 
 */
router.post('/publish', async (ctx, next) => {
  const params = ctx.request.body

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

module.exports = router

export { }
