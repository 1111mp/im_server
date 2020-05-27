const router = require('koa-router')()
const AsyncLock = require('async-lock')
const { Op } = require('sequelize/lib/sequelize')
// const db = require('../common/models')
const { Dynamic, Star } = require('../common/models')
const { STARREDISKEY, STARRCOUNTKEY, STARLOCK } = require('../common/const')

const lock = new AsyncLock()

router.prefix('/dynamic')

/** 从缓存或数据库中获取动态的点赞总数 优先缓存 */
async function getStarCount(ctx, dynamicId) {
  let count
  let redisCount = await ctx.redis.redis.hmget('starCounts', [dynamicId])
  if (redisCount[0] === null) {
    count = await Star.count({
      where: {
        dynamicId: {
          [Op.eq]: dynamicId
        }
      }
    })
    await ctx.redis.redis.hmset('starCounts', new Map([[dynamicId, count]]))
  } else {
    count = redisCount[0]
  }
  return Number(count)
}

/**
 * @description: 查询用户发表的所有动态
 * @param {number} userId 用户id
 * @param {number} pageNo 页码
 * @param {number} pageSize 分页大小
 * @return: 
 */
router.post('/queryUserAllDynamic', async (ctx, next) => {
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

    dynamics = await Promise.all(dynamics.map(async dynamic => {
      /** 先序列化 再操作 */
      dynamic = dynamic.toJSON()
      dynamic['starCount'] = await getStarCount(ctx, dynamic.id)
      return dynamic
    }))

    ctx.body = {
      code: 200,
      totalCount,
      data: dynamics
    }

  } catch (err) {

    ctx.throw(400, err)

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
 * @param {0 | 1} status 动态id 
 * @return: 
 */
// https://blog.csdn.net/solocoder/article/details/83713626?utm_medium=distribute.pc_relevant.none-task-blog-BlogCommendFromMachineLearnPai2-1.nonecase&depth_1-utm_source=distribute.pc_relevant.none-task-blog-BlogCommendFromMachineLearnPai2-1.nonecase
router.post('/star', async (ctx, next) => {
  const params = ctx.request.body
  const userId = ctx.userId

  if (!params.dynamicId || !params.status) {
    ctx.body = {
      code: 400,
      msg: 'dynamicId or status cannot be emptyed!'
    }
    return false
  }

  try {
    lock.acquire(STARLOCK, async (done) => {
      const key = `${userId}::${params.dynamicId}`

      const redisCount = await ctx.redis.redis.hmget(STARRCOUNTKEY, [params.dynamicId])
      let count = redisCount[0]
      if (count === null) {
        count = await Star.count({
          where: {
            dynamicId: {
              [Op.eq]: params.dynamicId
            }
          }
        })
      }
      count = Number(count)
      params.status === 1 ? count++ : (count < 1 ? 0 : count--)

      ctx.redis.redis.multi()
        .hmset(STARREDISKEY, new Map([[key, params.status]]))
        .hmget(STARRCOUNTKEY, new Map([[params.dynamicId, count]]))
        .exec((err, results) => {
          if (err) {
            ctx.throw(400, err)
          }
          ctx.body = {
            code: 200,
            msg: params.status === 1 ? 'like successed' : 'cancel likes successed'
          }
          done()
        })
    }, (err, ret) => {

    })

  } catch (err) {
    ctx.throw(400, err)
  }

})

module.exports = router

export { }
