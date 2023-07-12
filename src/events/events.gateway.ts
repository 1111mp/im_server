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
  private users: Map<number, string>;

  constructor(
    private readonly eventsService: EventsService,
    private readonly protoService: ProtoService,
  ) {
    this.users = new Map();
  }

  @WebSocketServer()
  private io: Server<ListenEvents, EmitEvents>;

  // Gateway initialized (provided in module and instantiated)
  afterInit(): void {
    this.logger.log(`Websocket Gateway initialized.`);
  }

  handleConnection(client: Socket) {
    const { user } = client.decoded;
    this.users.set(user.id, client.id);
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
  async handleMessage(
    @MessageBody() data: Uint8Array,
    @ConnectedSocket() client: Socket,
  ): Promise<Uint8Array> {
    // There is no sender's info when the server receives the message.
    const message = this.protoService.getMessageFromProto(data);

    try {
      // create one message in db
      const { id } = await this.eventsService.createOneForMessage(message);

      await this.eventsService.addMessageTaskToQueue({
        ...message,
        id,
        senderInfo: client.decoded.user,
      });
    } catch (err) {
      // something error
      this.logger.error(`[message] ${err.name}: ${err.message}`);
      return this.protoService.setAckToProto({
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: 'Database Error.',
      });
    }

    return this.protoService.setAckToProto({
      statusCode: HttpStatus.OK,
      message: 'Successfully.',
    });
  }

  // send message task
  @Process({ name: 'send-message', concurrency: 100 })
  private async handleMessageTask(job: Job<ModuleIM.Core.MessageBasic>) {
    this.logger.debug('Start send message task...');
    const { groupId, receiver } = job.data;

    switch (groupId) {
      case void 0: {
        // single message
        await this.sendMessage(receiver, job.data);
        break;
      }
      default: {
        // group message
        await this.sendMessageForGroup(job.data);
        break;
      }
    }

    this.logger.debug('Send message task completed');
  }

  /************************* for read message ******************************/

  // for read message
  @SubscribeMessage('on-message:read')
  async handleMessageRead(
    @MessageBody() data: Uint8Array,
    @ConnectedSocket() client: Socket,
  ): Promise<Uint8Array> {
    const message = this.protoService.getMessageReadFromProto(data);

    const [instance, affectedCount] = await this.eventsService.upsertLastRead(
      message,
    );

    if (!instance && !affectedCount) {
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
  @Process({ name: 'send-message:read', concurrency: 100 })
  private async handleMessageReadTask(job: Job<ModuleIM.Core.MessageRead>) {
    this.logger.debug('Start send message:read task...');

    const { groupId } = job.data;

    switch (groupId) {
      case void 0: {
        // single message
        const { statusCode } = await this.sendMessageForRead(job.data);

        // timeout
        statusCode === HttpStatus.REQUEST_TIMEOUT &&
          this.logger.debug(
            `[id]: ${job.data.id} [sender]: ${job.data.sender} [receiver]: ${job.data.receiver}. Message send timeout.`,
          );

        // statusCode === HttpStatus.OK: dont need do anything
        break;
      }
      default: {
        // group message
        // Push read messages of group chat messages in real time?
        // todo
        break;
      }
    }

    this.logger.debug('Send message:read task completed');
  }

  /******************************** for notify *************************************/

  // listener when receive notify
  @SubscribeMessage('on-notify')
  handleNotify(
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
  @Process({ name: 'send-notify', concurrency: 50 })
  private async handleNotifyTask(job: Job<ModuleIM.Core.Notify>) {
    this.logger.debug('Start send notify task...');

    const { statusCode } = await this.sendNotify(job.data);

    switch (statusCode) {
      case HttpStatus.REQUEST_TIMEOUT: {
        // timeout
        const { id, sender, receiver } = job.data;
        this.logger.debug(
          `[id]: ${id} [sender]: ${sender.id} [receiver]: ${receiver}. Notify send timeout.`,
        );

        break;
      }
      case HttpStatus.OK: {
        const { status } = job.data;
        if (status !== ModuleIM.Common.NotifyStatus.Initial) break;

        // received
        const [count] = await this.eventsService.updateNotifyStatus(
          job.data.id,
          ModuleIM.Common.NotifyStatus.Received,
        );

        count !== 1 &&
          this.logger.error(
            `[Database Error] unknown error when update notify(${job.data.id}) status.`,
          );

        break;
      }
      case HttpStatus.NO_CONTENT:
      default: {
        // offline, dont need do anything
        break;
      }
    }

    this.logger.debug(`[${job.data.id}] Send notify task completed`);
  }

  /***************************** Utils ***********************************/

  private async sendMessageForGroup(message: ModuleIM.Core.MessageBasic) {
    const { groupId } = message;

    const members = await this.eventsService.getGroupMembersById(groupId);

    //? Optimization: Should the task be split into multiple queues if the number of members is too large
    await Promise.all(members.map(({ id }) => this.sendMessage(id, message)));
  }

  private async sendMessage(
    receiver: number,
    message: ModuleIM.Core.MessageBasic,
  ) {
    const { statusCode } = await this.sendMessageForSingle(receiver, message);

    if (statusCode === HttpStatus.NO_CONTENT) return;

    const { id } = message;
    const { lastAck = null, lastAckErr = null } =
      (await this.eventsService.getLastAck(receiver)) || {};

    let newLastAck: bigint = lastAck,
      newLastAckErr: bigint = lastAckErr;

    switch (statusCode) {
      case HttpStatus.OK: {
        // successfully
        lastAckErr === null
          ? id > lastAck && (newLastAck = id)
          : id < lastAckErr && (newLastAck = id);
        break;
      }
      default: {
        // failed
        lastAckErr === null
          ? (newLastAckErr = id)
          : id <= lastAckErr && (newLastAckErr = id);

        id <= lastAck && (newLastAck = id - BigInt(1));
        break;
      }
    }

    await this.eventsService.upsertLastAck({
      receiver,
      lastAck: newLastAck,
      lastAckErr: newLastAckErr,
    });
  }

  private async sendMessageForSingle(
    receiver: number,
    message: ModuleIM.Core.MessageBasic,
  ) {
    const userStatus = this.getStatus(receiver);

    if (!userStatus)
      // offline, dont need do anything
      return { statusCode: HttpStatus.NO_CONTENT, message: 'User is offline' };

    // online
    return await this.send(
      receiver,
      ModuleIM.Common.MessageEventNames.Message,
      this.protoService.setMessageToProto(message),
    );
  }

  private async sendMessageForRead(message: ModuleIM.Core.MessageRead) {
    const { receiver } = message;
    const userStatus = this.getStatus(receiver);

    if (!userStatus)
      // offline, dont need do anything
      return { statusCode: HttpStatus.NO_CONTENT, message: 'User is offline' };

    // online
    return await this.send(
      receiver,
      ModuleIM.Common.MessageEventNames.Read,
      this.protoService.setMessageReadToProto(message),
    );
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

    if (!userStatus)
      // offline, dont need do anything
      return { statusCode: HttpStatus.NO_CONTENT, message: 'User is offline' };

    // online
    const message = this.protoService.setNotifyToProto(notify);
    const result = await this.send(
      receiver,
      ModuleIM.Common.MessageEventNames.Notify,
      message,
    );

    return result;
  }

  /**
   * @description: Push a message to client.
   * @param receiver number
   * @param evtName ModuleIM.Common.MessageEventNames
   * @param message Uint8Array
   * @param timer number = 6000
   * @return Promise<IMServerResponse.AckResponse>
   */
  private async send(
    receiver: number,
    evtName: ModuleIM.Common.MessageEventNames,
    message: Uint8Array,
    timer: number = 6000, // milliseconds
  ): Promise<IMServerResponse.AckResponse> {
    return new Promise((resolve) => {
      const socketId = this.users.get(receiver);
      this.io
        .to(socketId)
        .timeout(timer)
        .emit(evtName, message, (err, respBuffer) => {
          resolve(
            err
              ? {
                  statusCode: HttpStatus.REQUEST_TIMEOUT,
                  message: 'timeout',
                }
              : this.protoService.getAckFromProto(respBuffer[0]),
          );
        });
    });
  }
}
