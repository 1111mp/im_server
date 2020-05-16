const router = require('koa-router')()
const jwt = require('jsonwebtoken')
const { v4 } = require('uuid')
const bcrypt = require('bcrypt')
const User = require('../models/user')
const Op = require('sequelize').Op
const { secretOrPrivateKey, tokenExp } = require('../../config')

router.prefix('/login')

/**
 * @description: 登录接口
 * @param {string} username 用户名
 * @param {string} pwd 密码
 * @return: 
 */
router.post('/', async (ctx, next) => {
  const { username, pwd } = ctx.request.body

  if (!username || !pwd) {
    ctx.body = {
      code: 401,
      msg: 'username or pwd cannot be empty'
    }
    return
  }

  const user = await User.findOne({
    where: {
      name: {
        [Op.eq]: `${username}`
      }
    }
  })
  console.log(user)

  if (!user) {
    ctx.body = {
      code: 403,
      msg: 'please register first'
    }
    return
  }

  const { pwdHash } = user
  const isPwd = bcrypt.compareSync(pwd, pwdHash)
  if (isPwd) {
    // 密码正确 生成token和key 将token存在redis的key中 并将key返回给前端
    const key = v4()
    const token = jwt.sign(user, secretOrPrivateKey)
    ctx.session.set(token, { sid: key, maxAge: tokenExp })
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

export { }
