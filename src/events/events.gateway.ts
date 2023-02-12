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

@UsePipes(new ValidationPipe())
@Processor(IMQueueName)
@WebSocketGateway({
  namespace: 'socket/v1/IM',
})
export class EventsGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  private readonly logger = new Logger(EventsGateway.name);
  private users: Map<number, User.UserInfo & { socketId: string }>;

  constructor(
    private readonly eventsService: EventsService,
    private readonly protoService: ProtoService,
  ) {
    this.users = new Map();
  }

  @WebSocketServer()
  private io: Server;

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

  // message for text
  @SubscribeMessage('on-message:text')
  private async handleMessageText(
    @MessageBody() data: Uint8Array,
    @ConnectedSocket() client: Socket,
  ): Promise<Uint8Array> {
    try {
      // There is no sender's info when the server receives the message.
      const message = {
        ...this.protoService.getMessageTextFromProto(data),
        sender: client.decoded.user,
      };

      // create one message in db
      await this.eventsService.createOneForMessage(message);

      await this.eventsService.addMessageTaskToQueue(message);

      return this.protoService.setAckToProto({
        statusCode: HttpStatus.OK,
        message: 'Successfully.',
      });
    } catch (err) {
      // something error
      this.logger.error(`[message:text] ${err.name}: ${err.message}`);
      return this.protoService.setAckToProto({
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: 'Something Error.',
      });
    }
  }

  // message for image
  @SubscribeMessage('on-message:image')
  private handleMessageImage(
    @MessageBody() data: Uint8Array,
    @ConnectedSocket() client: Socket,
  ) {
    const message = this.protoService.getMessageImageFromProto(data);

    switch (message.session) {
      case ModuleIM.Common.Session.Single: {
        // single message
        return;
      }
      case ModuleIM.Common.Session.Group: {
        // group message
        return;
      }
      default:
        // dont need do anything
        this.logger.debug(`Unknown message session type: ${message.session}`);
        return;
    }
  }

  // send message:all task
  @Process('send-message:all')
  private async handleMessageTask(job: Job<ModuleIM.Core.MessageAll>) {
    this.logger.debug('Start send message task...');

    const { session } = job.data;

    switch (session) {
      case ModuleIM.Common.Session.Single: {
        // single message
        const { statusCode } = await this.sendMessageForSingle(job.data);

        if (statusCode === HttpStatus.REQUEST_TIMEOUT) {
          // timeout
          const { id, sender, receiver } = job.data;
          this.logger.debug(
            `[id]: ${id} [sender]: ${sender.id} [receiver]: ${receiver}. Message send timeout.`,
          );
        }

        if (statusCode === HttpStatus.OK) {
          // received
          const [count] = await this.eventsService.updateMessageStatus(
            job.data.id,
            ModuleIM.Common.MsgStatus.Received,
          );

          if (count !== 1) {
            this.logger.error(
              `[Database Error] unknown error when update notify(${job.data.id}) status.`,
            );
          }
        }

        break;
      }
      case ModuleIM.Common.Session.Group: {
        // group message
        break;
      }
      default:
        // dont need do anything
        this.logger.debug(`Unknown message session type: ${session}`);
        break;
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

    const [count] = await this.eventsService.handleForMessageRead(message);

    if (count !== 1) {
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
  @Process('send-message:read')
  private async handleMessageReadTask(job: Job<ModuleIM.Core.MessageRead>) {
    this.logger.debug('Start send message:read task...');

    const { session } = job.data;

    switch (session) {
      case ModuleIM.Common.Session.Single: {
        // single message
        const { statusCode } = await this.sendMessageForRead(job.data);

        if (statusCode === HttpStatus.REQUEST_TIMEOUT) {
          // timeout
          const { id, sender, receiver } = job.data;
          this.logger.debug(
            `[id]: ${id} [sender]: ${sender} [receiver]: ${receiver}. Message send timeout.`,
          );
        }

        if (statusCode === HttpStatus.OK) {
          // received
          const [count] = await this.eventsService.updateMessageReadStatus(
            job.data.id,
            ModuleIM.Common.MsgStatus.Received,
          );

          if (count !== 1) {
            this.logger.error(
              `[Database Error] unknown error when update notify(${job.data.id}) status.`,
            );
          }
        }
        break;
      }
      case ModuleIM.Common.Session.Group: {
        // group message
        break;
      }
      default:
        // dont need do anything
        this.logger.debug(`Unknown message:read session type: ${session}`);
        break;
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
  @Process('send-notify')
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

    this.logger.debug('Send notify task completed');
  }

  /***************************** Utils ***********************************/

  private async sendMessageForSingle(message: ModuleIM.Core.MessageAll) {
    const { type, receiver } = message;
    let buffer: Uint8Array;
    switch (type) {
      case ModuleIM.Common.MsgType.Text: {
        buffer = this.protoService.setMessageTextToProto(message);
        break;
      }
      case ModuleIM.Common.MsgType.Image: {
        buffer = this.protoService.setMessageImageToProto(message);
        break;
      }
      default:
        return {
          statusCode: HttpStatus.BAD_GATEWAY,
          message: `Unknown message type: ${type}`,
        };
    }

    const userStatus = this.getStatus(receiver);
    if (userStatus) {
      // online
      return await this.send(
        `${receiver}`,
        ModuleIM.Common.MessageEventNames.Message,
        buffer,
      );
    } else {
      // offline, dont need do anything
      return { statusCode: HttpStatus.NO_CONTENT, message: 'User is offline' };
    }
  }

  private async sendMessageForRead(message: ModuleIM.Core.MessageRead) {
    const { receiver } = message;

    const buffer = this.protoService.setMessageReadToProto(message);

    const userStatus = this.getStatus(receiver);
    if (userStatus) {
      // online
      return await this.send(
        `${receiver}`,
        ModuleIM.Common.MessageEventNames.Read,
        buffer,
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
        `${receiver}`,
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
    receiver: string,
    evtName: string,
    message: Uint8Array,
    timer: number = 6000,
  ) {
    const promise: Promise<IMServerResponse.AckResponse> = new Promise(
      (resolve) => {
        this.io.to(receiver).emit(evtName, message, (data: Uint8Array) => {
          resolve(this.protoService.getAckFromProto(data));
        });
      },
    );

    const timeout: Promise<IMServerResponse.AckResponse> = new Promise(
      (resolve) => {
        setTimeout(() => {
          resolve({
            statusCode: HttpStatus.REQUEST_TIMEOUT,
            message: 'timeout',
          });
        }, timer);
      },
    );

    return Promise.race([promise, timeout]);
  }
}
