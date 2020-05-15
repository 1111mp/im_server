const router = require('koa-router')()

router.get('/', async (ctx, next) => {
  ctx.session.user = '1111111111'
  await ctx.render('index', {
    title: 'Hello Koa 2ss!'
  })
})

router.get('/string', async (ctx, next) => {
  console.log(ctx.session.user)
  ctx.body = 'koassss2 strisssssssssssng'
})

router.get('/json', async (ctx, next) => {
  ctx.body = {
    title: 'koa2 json'
  }
})

module.exports = router

export { }
