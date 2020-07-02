const Koa = require('koa')
const app = new Koa()
const views = require('koa-views')
const json = require('koa-json')
const onerror = require('koa-onerror')
const koaBody = require('koa-body')
const compose = require('koa-compose')
const staticServ = require('koa-static')
const path = require('path')

const redis = require('./common/middlewares/redis')
const Auth = require('./common/middlewares/auth')
const timerTask = require('./common/utils/timerTask')
const { createLogger, logs } = require('./common/middlewares/logger')
const routes = require('./routes')
const { unlessPaths, uploadPath } = require('./config')
const asycStarData = require('./common/utils/syncStarData')
require('./common/models')

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
  /** http://www.ptbird.cn/koa-body.html */
  json(),
  koaBody({
    multipart: true,
    // encoding: 'gzip',
    formidable: {
      uploadDir: uploadPath,
      keepExtensions: true,
      maxFieldsSize: 2 * 1024 * 1024,
      onFileBegin: (name, file) => {
        // console.log(`name: ${name}`)
        // console.log(`file: ${file}`)
      }
    }
  }),
  Auth().unless({ path: unlessPaths }),
  createLogger(),
  staticServ(__dirname + '/public'),
  views(__dirname + '/views', {
    extension: 'pug'
  })
]

app.use(compose(middlewares))

// routes
Object.keys(routes).map(route => {
  app.use(routes[route].routes(), routes[route].allowedMethods())
})


/** 定时任务 */
timerTask(asycStarData)

// error-handling
app.on('error', (err, ctx) => {
  console.error('server error', err, ctx)
});

module.exports = app

export { }
