const Koa = require('koa')
const app = new Koa()
const views = require('koa-views')
const json = require('koa-json')
const onerror = require('koa-onerror')
const bodyparser = require('koa-bodyparser')
const compose = require('koa-compose')
const staticServ = require('koa-static')
// const session = require("koa-session2")
import session from "koa-session2"
require('./sequelize')

const { createLogger, logs } = require('./middlewares/logger')
const RedisStore = require("./redis")
const index = require('./routes/index')
const users = require('./routes/users')

app.keys = ['keys', 'keykeys']

// error handler
onerror(app)

const middlewares = [
  async (ctx, next) => {
    /** 将logs设置到ctx上 方便后续使用 */
    ctx.log4js = logs
    await next()
  },
  session({
    store: new RedisStore()
  }),
  bodyparser({
    enableTypes: ['json', 'form', 'text']
  }),
  json(),
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
