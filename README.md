# im_server

一个 IM 应用的纯后台服务，对应的客户端目前为：[electron_client](https://github.com/1111mp/electron_client)

接口文档可在服务启动之后（[Swagger Ui](https://swagger.io/tools/swagger-ui/)），浏览器访问 `http://localhost:3000/api/docs` 查看

数据库：mariadb

缓存：redis

（本地需要安装数据库和 redis）

数据库 ORM 库：sequelize

配置文件（用到的 key）：
`.env.dev`:

```
PORT=3000
SECRET_KEY=random_str
USER_AUTH_KEY=user_auth

DB_USER=root
DB_PASS=************
DB_NAME=database_test
DB_HOST=127.0.0.1
DB_PORT=3306

REDIS_HOST=127.0.0.1
REDIS_PORT=6379
REDIS_USERNAME=root
REDIS_PWD=root
REDIS_DB=0

MULTER_DEST=/upload
CLIENTORIGIN=http://localhost:3000___http://localhost:1212___http://127.0.0.1:1212
```

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

## IM Protocol

关于 IM 实现的设计可以查看[掘金文档](https://juejin.cn/post/7202583557751865401)，阅读体验更好

[Socket.io](https://socket.io/zh-CN/)

```
type MessageBasic = {
  id: bigint;
  msgId: string;
  type: Common.MsgType;
  sender: number;
  senderInfo: Omit<User.UserAttributes, 'pwd'>;
  groupId?: number;
  receiver: number; // userId or groupId
  content: string;
  timer: string;
  ext?: string; // reserved field
};

```

```
interface AckResponse {
  statusCode: HttpStatus;
  message?: string;
}

const enum MessageEventNames {
  Message = 'on-message',
  Notify = 'on-notify',
  Read = 'on-message:read',
}
```

Message Events:

`on-message`: send a message.

example:

`Server` to send:

```
const message: MessageBasic = {
  msgId: string;
  type: Common.MsgType;
  sender: number;
  senderInfo: Omit<User.UserAttributes, 'pwd'>;
  groupId?: number; // if group message
  receiver: number; // userId or groupId
  content: string;
  timer: string;
  ext?: string; // reserved field
}

const buffer = setMessageToProto(message);

client.socket.emit("on-message", buffer, (result: AckResponse) => {
   console.log(result);
   // result.statusCode === 200 ===> successed
})
```

`Client` listener:

```
  // on-message:text
  client.socket.on(MessageEventNames.Message, (msg: Uint8Array, callback: (resp: AckResponse) => void) => {
    const message: MessageText = getMessageFromProto(msg);
    console.log(message);
    callback({
      statusCode: 200,
      message: "..."
    })
  })
```

#### Notify

```
type Notify = {
  id: string;
  type: Common.Notifys;
  sender: Omit<User.UserAttributes, 'pwd'>;
  receiver: number;
  status: Common.NotifyStatus;
  timer: string;
  remark?: string;
  ext?: string;
};
```

example:

```
const notify: Notify = {
    id: string;
    type: Common.Notifys;
    sender: Omit<User.UserAttributes, 'pwd'>;
    receiver: number;
    status: Common.NotifyStatus;
    timer: string;
    remark?: string;
    ext?: string;
}

const buffer = setNotifyToProto(notify);

client.socket.emit("on-notify", buffer, (result: AckResponse) => {
   console.log(result);
   // result.statusCode === 200 ===> successed
})
```

Client listener:

```
  // on-notify
  client.socket.on(MessageEventNames.Notify, (msg: Uint8Array, callback: (resp: AckResponse) => void) => {
    const notify: Notify = getNotifyFromProto(msg);
    console.log(notify);
    callback({
      statusCode: 200,
      message: "..."
    })
  })
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
