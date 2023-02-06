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
import type { Server, Socket } from 'socket.io';
import { EventsService } from './events.service';
import { ProtoService } from 'src/common/proto/proto.service';

@UsePipes(new ValidationPipe())
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

  @SubscribeMessage('message')
  private handleMessage(
    @MessageBody() data: unknown,
    @ConnectedSocket() client: Socket,
  ): Uint8Array {
    return this.makeAckResp();
  }

  @SubscribeMessage('notify')
  private handleNotify(
    @MessageBody() data: Uint8Array,
    @ConnectedSocket() client: Socket,
  ) {
    const notify = this.protoService.getNotifyFromProto(data);
    const { type } = notify;
    switch (type) {
      case ModuleIM.Common.Notifys.AddFriend: {
        // agree or reject friend request
        return;
      }
      default:
        // dont need do anything
        return;
    }
  }

  public async sendNotify(
    notify: ModuleIM.Core.Notify,
  ): Promise<IMServerResponse.AckResponse> {
    const { receiver } = notify;
    const userStatus = this.getStatus(receiver);
    if (userStatus) {
      // online
      const message = this.makeNotifyProto(notify);
      const result = await this.send(
        `${receiver}`,
        ModuleIM.Common.MessageType.Notify,
        message,
      );

      return result;
    } else {
      // offline, dont need do anything
      return { statusCode: HttpStatus.OK, message: 'User is offline' };
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
          resolve(this.getAckResp(data));
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

  private makeAckResp() {
    return this.protoService.setAckToProto({
      statusCode: HttpStatus.OK,
      message: 'Successed.',
    });
  }

  private getAckResp(data: Uint8Array) {
    return this.protoService.getAckFromProto(data);
  }

  private makeNotifyProto(notify: ModuleIM.Core.Notify) {
    return this.protoService.setNotifyToProto(notify);
  }
}
