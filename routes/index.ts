const router = require('koa-router')()
const jwt = require('jsonwebtoken')
const { v4 } = require('uuid')
const bcrypt = require('bcrypt')
const User = require('../models/user')
const { Op } = require('sequelize/lib/sequelize')
const { secretOrPrivateKey, tokenExp } = require('../config')

router.get('/', async (ctx, next) => {
  await ctx.render('index', {
    title: 'Hello Koa 2ss!'
  })
})

/**
 * @description: 登录接口
 * @param {string} username 用户名
 * @param {string} pwd 密码
 * @return: 
 */
router.post('/login', async (ctx, next) => {
  const { username, pwd } = ctx.request.body
  console.log(ctx.request.body)

  if (!username || !pwd) {
    ctx.body = {
      code: 401,
      msg: 'username or pwd cannot be empty'
    }
    return
  }

  const user = await User.findOne({
    where: {
      username: {
        [Op.eq]: `${username}`
      }
    }
  })

  if (!user) {
    ctx.body = {
      code: 403,
      msg: 'please register first'
    }
    return
  }

  const { dataValues } = user
  const isPwd = bcrypt.compareSync(pwd, dataValues.pwd)
  if (isPwd) {
    // 密码正确 生成token和key 将token存在redis的key中 并将key返回给前端
    const key = v4()
    const token = jwt.sign(dataValues, secretOrPrivateKey)
    ctx.redis.set(key, token, tokenExp)
    ctx.body = {
      code: 200,
      data: key
    }
  } else {
    // 密码错误
    ctx.body = {
      code: 403,
      msg: 'Incorrect password'
    }
  }

})

/** 登出 */
router.post('/logout', async (ctx, next) => {
  const { token } = ctx.headers

  // 清除redis中token的缓存
  ctx.redis.destroy(token)
})

module.exports = router

export { }
