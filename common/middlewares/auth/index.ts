const jwt = require('jsonwebtoken')
const unless = require('koa-unless')
const { secretOrPrivateKey, tokenExp } = require('../../../config')

/**
 * 返回前端的token为存在redis中真正token的key
 */
module.exports = function () {
  const auth = async (ctx, next) => {

    const { token } = ctx.headers
    if (!token) ctx.throw(401, 'Authentication Error')

    // 获取redis中的token
    const realToken = await ctx.redis.get(token)

    if (!realToken) {

      ctx.throw(401, 'Authentication Error')

    } else {
      // 校验token
      try {
        // @ts-ignore
        let decoded = jwt.verify(realToken, secretOrPrivateKey)
        
        ctx.userId = decoded.id
        // 校验成功之后 自动延长token的缓存时间
        ctx.redis.set(token, realToken, tokenExp)
      } catch (err) {

        if (err.name === 'TokenExpiredError') {

          ctx.throw(401, `Authentication expired. expired at ${err.expiredAt}`)

        } else {

          ctx.throw(401, 'Authentication malformed')

        }

      }
    }

    return next()
  }

  auth.unless = unless

  return auth
}

export { }
