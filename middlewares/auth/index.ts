const jwt = require('jsonwebtoken')
const { unlessPaths, secretOrPrivateKey, tokenExp } = require('../../config')

/**
 * 返回前端的token为存在redis中真正token的key
 */
module.exports = function () {
  return (ctx, next) => {
    const path = ctx.path
    let index = unlessPaths.findIndex((unlessPath) => unlessPath === path)

    if (index !== -1) return next()

    const { token } = ctx.headers
    if (!token) ctx.throw(401, 'Authentication Error')

    // 获取redis中的token
    const realToken = ctx.session[token]

    if (!realToken) {

      ctx.throw(401, 'Authentication Error')

    } else {
      // 校验token
      try {

        // @ts-ignore
        let decoded = jwt.verify(realToken, secretOrPrivateKey)
        // 校验成功之后 自动延长token的缓存时间
        ctx.session.set(realToken, { sid: token, maxAge: tokenExp })
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
}

export { }
