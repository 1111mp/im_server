const router = require('koa-router')()
const User = require('../common/controllers/user')

router.prefix('/users')

router.get('/', function (ctx, next) {
  ctx.body = 'this is a users response!'
})

/** 获取所有user */
router.post('/queryAll', User.queryAll)

/** 用户注册 */
router.post('/register', User.register)

module.exports = router

export { }
