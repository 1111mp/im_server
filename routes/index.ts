const router = require('koa-router')()

router.get('/', async (ctx, next) => {
  await ctx.render('index', {
    title: 'Hello Koa 2ss!'
  })
})

router.get('/string', async (ctx, next) => {
  ctx.body = 'koassss2 strisssssssssssng'
})

router.get('/json', async (ctx, next) => {
  ctx.body = {
    title: 'koa2 json'
  }
})

module.exports = router

export { }
