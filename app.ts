const Koa = require('koa')
const app = new Koa()
const views = require('koa-views')
const json = require('koa-json')
const onerror = require('koa-onerror')
const bodyparser = require('koa-bodyparser')
const compose = require('koa-compose')
const staticServ = require('koa-static')
import session from "koa-session2"
require('./sequelize')

const Auth = require('./middlewares/auth')
const { createLogger, logs } = require('./middlewares/logger')
const RedisStore = require("./redis")
const index = require('./routes/index')
const users = require('./routes/users')
const login = require('./routes/login')

// 设置配置session的加密字符串，可以任意字符串
app.keys = ['random keys']

// error handler
onerror(app)

const middlewares = [
  async (ctx, next) => {
    /** 将logs设置到ctx上 方便后续使用 */
    ctx.log4js = logs
    await next()
  },
  // 处理Auth中throw的401错误
  async (ctx, next) => {
    return next().catch((err) => {
      if (401 == err.status) {
        ctx.status = 401
        ctx.body = {
          code: 401,
          msg: 'Protected resource, use Authorization header to get access\n'
        }
      } else {
        throw err
      }
    })
  },
  session({
    store: new RedisStore()
  }),
  bodyparser({
    enableTypes: ['json', 'form', 'text']
  }),
  json(),
  Auth(),
  createLogger(),
  staticServ(__dirname + '/public'),
  views(__dirname + '/views', {
    extension: 'pug'
  })
]

app.use(compose(middlewares))

// routes
app.use(index.routes(), index.allowedMethods())
app.use(users.routes(), users.allowedMethods())
app.use(login.routes(), login.allowedMethods())

// error-handling
app.on('error', (err, ctx) => {
  console.error('server error', err, ctx)
});

module.exports = app

export { }
