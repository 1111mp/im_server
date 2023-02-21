import { HttpStatus, Logger, UsePipes, ValidationPipe } from '@nestjs/common';
import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Process, Processor } from '@nestjs/bull';
import { EventsService } from './events.service';
import { ProtoService } from 'src/common/proto/proto.service';
import { IMQueueName } from './constants';
import type { Server, Socket } from 'socket.io';
import type { Job } from 'bull';

type AckCallback = (resp: Uint8Array) => void;

type ListenEvents = {};
type EmitEvents = Record<
  ModuleIM.Common.MessageEventNames,
  (buffer: Uint8Array, cb: AckCallback) => void
>;

@UsePipes(new ValidationPipe())
@Processor(IMQueueName)
@WebSocketGateway()
export class EventsGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  private readonly logger = new Logger(EventsGateway.name);
  private users: Map<number, User.UserInfo & { socketId: string }>;

  constructor(
    private readonly eventsService: EventsService,
    private readonly protoService: ProtoService,
  ) {
    this.users = new Map<number, User.UserInfo & { socketId: string }>();
  }

  @WebSocketServer()
  private io: Server<ListenEvents, EmitEvents>;

  // Gateway initialized (provided in module and instantiated)
  afterInit(): void {
    this.logger.log(`Websocket Gateway initialized.`);
  }

  handleConnection(client: Socket) {
    const { user } = client.decoded;
    this.users.set(user.id, { ...user, socketId: client.id });
  }

  handleDisconnect(client: Socket) {
    const { user } = client.decoded;
    this.users.delete(user.id);
  }

  private getStatus(userid: number) {
    return this.users.has(userid);
  }

  /****************************** for message ***********************************/

  @SubscribeMessage('on-message')
  private async handleMessage(
    @MessageBody() data: Uint8Array,
    @ConnectedSocket() client: Socket,
  ): Promise<Uint8Array> {
    // There is no sender's info when the server receives the message.
    const message = {
      ...this.protoService.getMessageFromProto(data),
      sender: client.decoded.user,
    };

    try {
      // create one message in db
      await this.eventsService.createOneForMessage(message);
    } catch (err) {
      // something error
      this.logger.error(`[message:text] ${err.name}: ${err.message}`);
      return this.protoService.setAckToProto({
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: 'Database Error.',
      });
    }

    await this.eventsService.addMessageTaskToQueue(message);

    return this.protoService.setAckToProto({
      statusCode: HttpStatus.OK,
      message: 'Successfully.',
    });
  }

  // send message:all task
  @Process({ name: 'send-message', concurrency: 100 })
  private async handleMessageTask(job: Job<ModuleIM.Core.MessageBasic>) {
    this.logger.debug('Start send message task...');

    const { id, groupId, sender, receiver } = job.data;

    if (groupId !== void 0) {
      // group message
    } else {
      // single message
      const { statusCode } = await this.sendMessageForSingle(job.data);
      const { lastAck = null, lastAckErr = null } =
        await this.eventsService.getAckInfo(receiver);

      let newLastAck: bigint = lastAck,
        newLastAckErr: bigint = lastAckErr;

      if (statusCode === HttpStatus.OK) {
        // successfully
        if (lastAckErr === null) {
          id > lastAck && (newLastAck = id);
        } else {
          id < lastAckErr && (newLastAck = id);
        }
      } else {
        // failed
        if (lastAckErr === null) {
          // 更新 lastAckErr 为当前 message.id
          newLastAckErr = id;
          id <= lastAck && (newLastAck = id - BigInt(1));
        } else {
          id <= lastAckErr && (newLastAckErr = id);
          id <= lastAck && (newLastAck = id - BigInt(1));
        }
      }

      await this.eventsService.upsertAck({
        receiver,
        lastAck: newLastAck,
        lastAckErr: newLastAckErr,
      });
    }

    this.logger.debug('Send message task completed');
  }

  /************************* for read message ******************************/

  // for read message
  @SubscribeMessage('on-message:read')
  private async handleMessageRead(
    @MessageBody() data: Uint8Array,
    @ConnectedSocket() client: Socket,
  ): Promise<Uint8Array> {
    const message = this.protoService.getMessageReadFromProto(data);

    const [_instance, _created] = await this.eventsService.handleForMessageRead(
      message,
    );

    if (!_instance) {
      this.logger.error(
        `[Message Read] Database error when update message(${message.id}) status.`,
      );

      return this.protoService.setAckToProto({
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: 'Database error.',
      });
    }

    await this.eventsService.addMessageReadTaskToQueue(message);

    return this.protoService.setAckToProto({
      statusCode: HttpStatus.OK,
      message: 'Successfully.',
    });
  }

  // send message:read task
  @Process({ name: 'send-message:read', concurrency: 50 })
  private async handleMessageReadTask(job: Job<ModuleIM.Core.MessageRead>) {
    this.logger.debug('Start send message:read task...');

    const { groupId } = job.data;

    if (groupId !== void 0) {
      // group message
    } else {
      // single message
      const { statusCode } = await this.sendMessageForRead(job.data);

      if (statusCode === HttpStatus.REQUEST_TIMEOUT) {
        // timeout
        const { id, sender, receiver } = job.data;
        this.logger.debug(
          `[id]: ${id} [sender]: ${sender} [receiver]: ${receiver}. Message send timeout.`,
        );
      }

      // if (statusCode === HttpStatus.OK) {
      //   // successfully received
      // }
    }

    this.logger.debug('Send message:read task completed');
  }

  /******************************** for notify *************************************/

  // listener when receive notify
  @SubscribeMessage('on-notify')
  private handleNotify(
    @MessageBody() data: Uint8Array,
    @ConnectedSocket() client: Socket,
  ) {
    const notify = this.protoService.getNotifyFromProto(data);
    switch (notify.type) {
      case ModuleIM.Common.Notifys.AddFriend: {
        // Agree or reject add friend request
        return;
      }
      case ModuleIM.Common.Notifys.DelFriend: {
        // Send a notification message to the other party when the user deletes a friend
        return;
      }
      default:
        // dont need do anything
        this.logger.debug(`Unknown notify type: ${notify.type}`);
        return;
    }
  }

  // send notify task
  @Process({ name: 'send-notify', concurrency: 25 })
  private async handleNotifyTask(job: Job<ModuleIM.Core.Notify>) {
    console.log(job);
    this.logger.debug('Start send notify task...');

    const { statusCode } = await this.sendNotify(job.data);

    if (statusCode === HttpStatus.REQUEST_TIMEOUT) {
      // timeout
      const { id, sender, receiver } = job.data;
      this.logger.debug(
        `[id]: ${id} [sender]: ${sender.id} [receiver]: ${receiver}. Notify send timeout.`,
      );
    }

    if (statusCode === HttpStatus.OK) {
      const { id, type, status } = job.data;
      if (
        type === ModuleIM.Common.Notifys.AddFriend &&
        (status === ModuleIM.Common.NotifyStatus.Fulfilled ||
          status === ModuleIM.Common.NotifyStatus.Rejected)
      ) {
        // dont need to do anything
        this.logger.debug(`[${id}] Send notify task completed`);
        return;
      }

      // received
      const [count] = await this.eventsService.updateNotifyStatus(
        job.data.id,
        ModuleIM.Common.NotifyStatus.Received,
      );

      if (count !== 1) {
        this.logger.error(
          `[Database Error] unknown error when update notify(${job.data.id}) status.`,
        );
      }
    }

    this.logger.debug(`[${job.data.id}] Send notify task completed`);
  }

  /***************************** Utils ***********************************/

  private async sendMessageForSingle(message: ModuleIM.Core.MessageBasic) {
    const { receiver } = message;
    const userStatus = this.getStatus(receiver);

    if (userStatus) {
      // online
      return await this.send(
        receiver,
        ModuleIM.Common.MessageEventNames.Message,
        this.protoService.setMessageToProto(message),
      );
    } else {
      // offline, dont need do anything
      return { statusCode: HttpStatus.NO_CONTENT, message: 'User is offline' };
    }
  }

  private async sendMessageForRead(message: ModuleIM.Core.MessageRead) {
    const { receiver } = message;
    const userStatus = this.getStatus(receiver);

    if (userStatus) {
      // online
      return await this.send(
        receiver,
        ModuleIM.Common.MessageEventNames.Read,
        this.protoService.setMessageReadToProto(message),
      );
    } else {
      // offline, dont need do anything
      return { statusCode: HttpStatus.NO_CONTENT, message: 'User is offline' };
    }
  }

  /**
   * @description: send a notify
   * @return {Promise<IMServerResponse.AckResponse>}
   */
  private async sendNotify(
    notify: ModuleIM.Core.Notify,
  ): Promise<IMServerResponse.AckResponse> {
    const { receiver } = notify;
    const userStatus = this.getStatus(receiver);
    if (userStatus) {
      // online
      const message = this.protoService.setNotifyToProto(notify);
      const result = await this.send(
        receiver,
        ModuleIM.Common.MessageEventNames.Notify,
        message,
      );

      return result;
    } else {
      // offline, dont need do anything
      return { statusCode: HttpStatus.NO_CONTENT, message: 'User is offline' };
    }
  }

  private async send(
    receiver: number,
    evtName: ModuleIM.Common.MessageEventNames,
    message: Uint8Array,
    timer: number = 6000, // milliseconds
  ): Promise<IMServerResponse.AckResponse> {
    return new Promise((resolve) => {
      const { socketId } = this.users.get(receiver);
      this.io
        .to(socketId)
        .timeout(timer)
        .emit(evtName, message, (err, respBuffer) => {
          console.log(respBuffer);
          resolve(
            err
              ? {
                  statusCode: HttpStatus.REQUEST_TIMEOUT,
                  message: 'timeout',
                }
              : (this.protoService
                  .getAckFromProto(respBuffer[0])
                  .toJSON() as IMServerResponse.AckResponse),
          );
        });
    });
  }
}
