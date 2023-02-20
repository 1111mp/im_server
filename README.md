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

## IM Protocol

[Socket.io](https://socket.io/zh-CN/)

#### 参考

[IM 群聊消息究竟是存 1 份(即扩散读)还是存多份(即扩散写)？](http://www.52im.net/thread-1616-1-1.html)

[IM 群聊消息的已读回执功能该怎么实现？](http://www.52im.net/thread-1611-1-1.html)

[求教 IM 离线消息，单聊和群聊是存一张表好还是分开存？](http://www.52im.net/forum.php?mod=viewthread&tid=4102&highlight=%B5%A5%C1%C4%BA%CD%C8%BA%C1%C4%2B%D2%BB%D5%C5%B1%ED)

## 单聊（保证消息不丢和用户不在线时的离线消息，以及解决大量离线消息时需要逐条向服务器发送 ack 已收到消息的回执）：

```
两张表
// Message Model
type MessageBasic = {
  id: bigint;
  msgId: string;
  type: Common.MsgType;
  sender: Omit<User.UserAttributes, 'pwd'>;
  groupId?: number; // if group message
  receiver: number; // userId or groupId
  content: string;
  timer: string;
  ext?: string; // reserved field
};

// MessageExt Model
{
  sender: number;
  receiver: number;
  groupId?: number; // if group message
  lastAck: bigint; // last ack msgId
  lastRead: bigint; // last read msgId
}
```

```
单聊和群聊的消息都放在一张表中（先不考虑客户端成功确认收到消息 ack 之后删除消息的动作，即消息一直存在数据库中）：
```

判断哪些消息是离线消息：

```
单聊的消息不存在写、读扩散的问题，每次发送服务端只需要存一条消息，用户登录时服务器通过判断 所有 msgId < lastAck 指向的 msgId 的消息为客户端未收到的离线消息
select * from Messages where id > lastAck
```

简述消息 send 到 receive 的整个过程：

约定此时 lastAck 值为 `msgId`

```
更新 lastAck:
this.messageExtModel.upsert(
  { sender, receiver, lastAck },
  { fields: ['lastAck'] },
);
```

如客户端 A 向客户端 B 发送消息 `msgId+1` 消息。

1. 首先服务器收到客户端 A 发送的 `msgId+1` 消息，往数据库写入一条 `msgId+1` 消息 & 向队列中添加一条给客户端 B 发送 `msgId+1` 消息的任务，然后通过 ack 告诉客户端 A 消息发送成功。此时客户端 A 发送 `msgId+1` 消息成功。

2. 然后服务器进入到队列任务中，开始向客户端发送 `msgId+1` 消息。

   用户不在线时，不需要做任何事直接结束当前任务。

   用户在线时，服务端 emit 消息事件向客户端 B 推送 msgId+1 消息，客户端 B 通过 ack 告知服务端是否成功接收，如成功接收服务端更新 lastAck 为 `msgId+1`，失败或者超时情况下将 lastAck 设置为 `(msgId+1) - 1` (这一步很重要，后续会解释为什么会这样处理)。

3. 此时，对于客户端 B 来说，如果离线，那么可以在下次登录通过 `select * from Messages where id > lastAck` 来获取所有的离线消息。在线时，那么消息会实时送达。此时整个消息的发送接收阶段结束。

#### 举例解释一下刚刚为什么在服务端向客户端 B 推送消息失败或者超时情况加要把 lastAck 强制设置为 (msgId+1) - 1 ：

如果客户端 A 向客户端 B（在线）发送了三条消息（客户端 B 离线则不存在这种消息丢失的问题）：`msgId+1 msgId+2 msgId+3`，到了服务端向客户端 B 推送消息时此时`msgId+1 和 msgId+3`成功，`msgId+2`失败或者超时，那么推送`msgId+3`消息成功时会将 lastAck 设置为 `msgId+3`，那么`msgId+2`消息会丢失，因为通过 `id > lastAck` 不能判断出`msgId+2`丢失了（下次用户在线离线消息也没有该消息）。

所以需要在推送失败或者超时情况下强制将 lastAck 设置为 `(msgId+2) - 1`，即 `msgId+1`，那么此时可以通过`id > lastAck`再拿到`msgId+2`消息。不过此时会出现`msgId+3`重复的情况，但是客户端接收消息时通过对消息的`id`做去重处理即可解决重复问题。用户重新拉取消息时会拿到`[msgId+2, msgId+3]`消息列表，然后客户端通过 ack 回执告知服务器将 lastAck 设置为最后一条消息`msgId+3`，此时保证了不丢消息，也不需要在大量离线消息时需要逐条向服务器发送 ack 已收到消息的回执。

#### 单聊消息的已读功能和保证消息不丢的 lastAck 机制相同，新增 lastRead 字段，为最后该用户最后已读消息的 id 字段，客户端通过消息的 `id <= lastRead` 来判断当前消息是否已读。

但是单聊消息的已读过程比 lastAck 机制稍简单一些：

1. 客户端 B 在已读`msgId`消息时，向服务端发送一条已读消息，服务端更新 lastRead 为 `msgId` & 向队列加入一个给客户端 A 推送已读消息的任务，然后通过 ack 告知客户端 B 发送已读消息成功，此时客户端 B 发送已读消息成功。

2. 然后服务器进入到队列中执行向客户端 A 推送`msgId`客户端 B 得已读消息。

   客户端 A 不在线时，不需要做任何处理，结束该任务。

   客户端 A 在线时，向客户端 A 推送这条已读消息，在推送成功、失败或者超时情况下都不需要做任何处理。

3. 对于客户端 A 来说存在如下情况：

   在线并成功接收到已读消息：客户端直接通过 `id <= lastRead` 判断当前消息是否已读。

   离线：下次在线时，客户端向服务端查询获取 lastRead ，然后通过`id <= lastRead` 判断消息是否已读。

   在线但是推送失败（客户端未接收到已读消息）：不需要做任何处理，因为消息的已读未读的实效性要求并不那么高，可以通过下一条消息的已读消息来更新，或者下次登录时查询最新的 lastRead 来更新。

## 群聊（利用群消息的“偏序”特性优雅地实现“只存 1 份”，以及实现群聊消息的已读未读功能）

群聊可复用上述单聊 lastAck & lastRead 机制，还是通过例子先简述发送群聊的整个过程：

约定此时 lastAck 为 `msgId`
此时数据库存在三条 MessageExt Model 数据：

```
{ sender: user1, receiver: user2, groupId: groupId, lastAck: msgId }
{ sender: user1, receiver: user3, groupId: groupId, lastAck: msgId }
{ sender: user1, receiver: user4, groupId: groupId, lastAck: msgId }
```

如一个群存在 `user1 user2 user3 user4` 四个成员（群的 id 记位 `groupId`），`user1` 向该群发送了一条 `msgId+1` 消息，此时 `user3` 离线， 其他人都在线：

1. 服务端收到 `user1` 发送的 `msgId+1` 消息，通过 `groupId` 判断出是向该群发送的一条消息，服务器向数据库写入一条 `msgId+1` 消息记录 & 向队列中添加一个向该群推送消息的任务，然后通过 ack 机制告知 `user1` 消息发送成功，此时对于 `user1` 该消息已发送成功。

2. 服务器进入到队列中执行向该群其他成员推送消息的任务。

   对于不在线用户 `user3`，不需要做任何事直接结束当前任务。

   对于在线用户 `user2 user4`，服务器分别向该用户推送 `msgId` 消息，客户端通过 ack 告知服务端是否成功接收，如成功接收服务端更新 lastAck 为 `msgId+1`同样失败或者超时情况下将 lastAck 设置为 `(msgId+1) - 1`。

   ```
   { sender: user1, receiver: user2, groupId: groupId, lastAck: msgId+1 }
   { sender: user1, receiver: user4, groupId: groupId, lastAck: msgId+1 }
   ```

3. 对于离线用户 `user3` 下次在线时可以通过 `select * from Messages where receiver = user2 & groupId = groupId & id > msgId` 来获取到所有离线消息。

   对于在线用户 `user2 user4` 在消息接收失败或者超时情况下，因为 lastAck 还是 `msgId`，下次在线可以也可以通过 `select * from Messages where receiver = user2 & groupId = groupId & id > msgId` 来获取到发送失败的消息（客户端根据消息的 id 去重）。

   此时三条 lastAck 都为最新的 `msgId+1`：

   ```
   { sender: user1, receiver: user2, groupId: groupId, lastAck: msgId+1 }
   { sender: user1, receiver: user3, groupId: groupId, lastAck: msgId+1 }
   { sender: user1, receiver: user4, groupId: groupId, lastAck: msgId+1 }
   ```

#### 群聊消息的已读消息跟单聊的类似，只不过需要根据每个群成员单独写一条数据

```
{ sender: user1, receiver: user2, groupId: groupId, lastRead: msgId+1 }
{ sender: user1, receiver: user3, groupId: groupId, lastRead: msgId+1 }
{ sender: user1, receiver: user4, groupId: groupId, lastRead: msgId+1 }
```

判断该 `msgId` 消息有哪些人已读：

```
select * from MessageExt where sender = sender & groupId = groupId & lastRead <= msgId;
```

判断该 `msgId` 消息有哪些人未读：

```
select * from MessageExt where sender = sender & groupId = groupId & lastRead > msgId;
```

## 遗留问题

当消息连续推送失败时，强制设置 lastAck 为当前 `msgId - 1` 方案存在问题。待解决。

### Message

#### 表设计

`Message Model`: id 字段递增 保证消息的“偏序”特性，实现只存 1 份消息即可

```
type MessageBasic = {
  id: bigint;
  msgId: string;
  type: Common.MsgType;
  sender: Omit<User.UserAttributes, 'pwd'>;
  groupId?: number; // if group message
  receiver: number; // userId or groupId
  content: string;
  timer: string;
  ext?: string; // reserved field
};

// MessageModel

import { Model, Table, Column, DataType } from 'sequelize-typescript';
import * as dayjs from 'dayjs';

@Table
export class Message extends Model<Message> {
  @Column({
    type: DataType.BIGINT,
    primaryKey: true,
    autoIncrement: true,
    unique: true,
  })
  id: bigint;

  @Column({ type: DataType.STRING, unique: true, allowNull: false })
  msgId: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
    validate: {
      isIn: [['text', 'image', 'video', 'audio']], // ModuleIM.Common.MsgType
    },
  })
  type: ModuleIM.Common.MsgType;

  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    comment: "sender's userid",
  })
  sender: number;

  @Column({
    type: DataType.INTEGER,
    allowNull: true,
    comment: 'groupId',
  })
  groupId: number;

  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    comment: "receiver's userid",
  })
  receiver: number;

  @Column({ type: DataType.STRING })
  content: string;

  @Column({
    type: DataType.DATE,
    defaultValue: DataType.NOW,
    get() {
      return dayjs(this.getDataValue('createdAt')).format(
        'YYYY-MM-DD HH:mm:ss',
      );
    },
  })
  createdAt;

  @Column({
    type: DataType.DATE,
    defaultValue: DataType.NOW,
    get() {
      return dayjs(this.getDataValue('updatedAt')).format(
        'YYYY-MM-DD HH:mm:ss',
      );
    },
  })
  updatedAt;
}

```

`MessageExt Model`

```
{
  sender: number;
  receiver: number;
  groupId?: number; // if group message
  lastAck: bigint; // last ack msgId
  lastRead: bigint; // last read msgId
}

// Record the ack and read status of the message

import {
  Model,
  Table,
  Column,
  DataType,
} from 'sequelize-typescript';
import * as dayjs from 'dayjs';

@Table({
  indexes: [
    {
      using: 'BTREE',
      fields: ['sender', 'receiver'],
    },
  ],
})
export class MessageExt extends Model<MessageExt> {
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    comment: "sender's userid",
  })
  sender: number;

  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    comment: "receiver's userid",
  })
  receiver: number;

  @Column({ type: DataType.INTEGER, allowNull: true })
  groupId: number;

  // @ForeignKey(() => Message)
  @Column({ type: DataType.BIGINT })
  lastAck: bigint;

  // @BelongsTo(() => Message, { foreignKey: 'lastAck', targetKey: 'id' })
  // message: Message;

  @Column({ type: DataType.BIGINT })
  lastRead: bigint;

  @Column({
    type: DataType.DATE,
    defaultValue: DataType.NOW,
    get() {
      return dayjs(this.getDataValue('createdAt')).format(
        'YYYY-MM-DD HH:mm:ss',
      );
    },
  })
  createdAt;

  @Column({
    type: DataType.DATE,
    defaultValue: DataType.NOW,
    get() {
      return dayjs(this.getDataValue('updatedAt')).format(
        'YYYY-MM-DD HH:mm:ss',
      );
    },
  })
  updatedAt;
}

```

```
type MessageBasic = {
  id: bigint;
  msgId: string;
  type: Common.MsgType;
  sender: Omit<User.UserAttributes, 'pwd'>;
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
  sender: Omit<User.UserAttributes, 'pwd'>;
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
