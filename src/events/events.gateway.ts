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

  // message for text
  @SubscribeMessage('message:text')
  private async handleMessageText(
    @MessageBody() data: Uint8Array,
    @ConnectedSocket() client: Socket,
  ) {
    const message = this.protoService.getMessageTextFromProto(data);

    switch (message.session) {
      case ModuleIM.Common.Session.Single: {
        // single message
        await this.eventsService.createOneForMessage(message);
        return this.makeAckResponse();
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

  // message for image
  @SubscribeMessage('message:image')
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

  @Process('im-message')
  private async handleMessageTask(job: Job<ModuleIM.Core.MessageAll>) {
    const { session } = job.data;

    switch (session) {
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
        this.logger.debug(`Unknown message session type: ${session}`);
        return;
    }
  }

  @SubscribeMessage('notify')
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

  @Process('notify')
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

  /**
   * @description: send a notify
   * @return {Promise<IMServerResponse.AckResponse>}
   */
  public async sendNotify(
    notify: ModuleIM.Core.Notify,
  ): Promise<IMServerResponse.AckResponse> {
    const { receiver } = notify;
    const userStatus = this.getStatus(receiver);
    if (userStatus) {
      // online
      const message = this.protoService.setNotifyToProto(notify);
      const result = await this.send(
        `${receiver}`,
        ModuleIM.Common.MessageType.Notify,
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

  private makeAckResponse() {
    return this.protoService.setAckToProto({
      statusCode: HttpStatus.OK,
      message: 'Successfully.',
    });
  }
}
