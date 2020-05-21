const Koa = require('koa')
const app = new Koa()
const views = require('koa-views')
const json = require('koa-json')
const onerror = require('koa-onerror')
const bodyparser = require('koa-bodyparser')
const compose = require('koa-compose')
const staticServ = require('koa-static')
require('./sequelize')

const redis = require('./middlewares/redis')
const Auth = require('./middlewares/auth')
const { createLogger, logs } = require('./middlewares/logger')
const index = require('./routes/index')
const users = require('./routes/users')
const { unlessPaths } = require('./config')

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
          msg: 'Protected resource, use Authorization header to get access'
        }
      } else {
        throw err
      }
    })
  },
  redis(),
  bodyparser({
    enableTypes: ['json', 'form', 'text']
  }),
  json(),
  Auth().unless({ path: unlessPaths }),
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

// error-handling
app.on('error', (err, ctx) => {
  console.error('server error', err, ctx)
});

module.exports = app

export { }
