# im_server

一个 IM 应用的纯后台服务，对应的客户端目前为：[electron_client](https://github.com/1111mp/electron_client)

接口文档可在服务启动之后（[Swagger Ui](https://swagger.io/tools/swagger-ui/)），浏览器访问 `http://localhost:3000/api/docs` 查看

数据库：mariadb、redis、sequelize 链接 mariadb 的配置文件：.env.dev

`日志系统` 借由 `log4js` 实现

已支持:

  [JSON Web Token](https://jwt.io/)

  [protocol-buffers](https://github.com/protobufjs/protobuf.js/)
  
  [Api Data Cache](https://github.com/1111mp/im_server/blob/nestjs/src/cache/interceptors/cache.interceptor.ts)

## Installation

```bash
$ yarn install
```

## Running the app

```bash
# development
$ yarn run start

# watch mode
$ yarn run start:dev

# production mode
$ yarn run start:prod
```

Or `F5` to `Debug` project.

## Test

```bash
# unit tests
$ yarn run test

# e2e tests
$ yarn run test:e2e

# test coverage
$ yarn run test:cov
```

## Notes

1. Authentication & Authorization has been achieved.

```
UserContext(req.user), example:
{
  regisTime: '2023-01-28 17:36:29',
  updateTime: '2023-01-28 17:36:30',
  id: 10009,
  account: '176xxxxxxxx',
  roleId: 5,
  roleName: 'admin',
  roleDesc: '管理员',
  permissions: [
    { id: 1, name: 'userGet', desc: 'Get user info' },
    { id: 2, name: 'userDel', desc: 'Delete user' }
  ]
}
```

2. `passport-jwt` 库的 `jwtFromRequest` 选项目前不支持异步函数，解决方案参考：[passport-jwt:187](https://github.com/mikenicholson/passport-jwt/pull/187)

3. 关于 pm2 启动 ts 项目的报错可参考：[pm2:2675](https://github.com/Unitech/pm2/issues/2675)
