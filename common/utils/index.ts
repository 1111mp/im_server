function getUser(ctx) {
  const { token } = ctx.headers
  const realToken = ctx.redis.get(token)

  
}