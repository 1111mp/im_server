# im_server

一个 IM 应用的纯后台服务，对应的客户端目前为：[electron_client](https://github.com/1111mp/electron_client)

接口文档可在服务启动之后（[Swagger Ui](https://swagger.io/tools/swagger-ui/)），浏览器访问 `http://localhost:3000/api/docs` 查看

Postman 导入可参考：[https://www.jianshu.com/p/91a5d7fd5fce](https://www.jianshu.com/p/91a5d7fd5fce)

数据库：mysql、redis、sequelize 链接 mysql 的配置文件：.env.dev
redis 配置：common/middlewares/redis

dev 环境

```
npm install or yarn
npm run start:watch or yarn start:watch
```

prod 环境

```
npm install pm2 -g or yarn global add pm2
pm2 install typescript
npm install ts-node -g or yarn global add ts-node
npm run prod or yarn prod
```

关于 pm2 启动 ts 项目的报错可参考：[pm2:2675](https://github.com/Unitech/pm2/issues/2675)
