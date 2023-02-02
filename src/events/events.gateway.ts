import { Logger, UsePipes, ValidationPipe } from '@nestjs/common';
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

@UsePipes(new ValidationPipe())
@WebSocketGateway({
  namespace: 'socket/v1/IM',
})
export class EventsGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  private readonly logger = new Logger(EventsGateway.name);

  constructor(private readonly eventsService: EventsService) {}

  @WebSocketServer()
  server: Server;

  // Gateway initialized (provided in module and instantiated)
  afterInit(): void {
    this.logger.log(`Websocket Gateway initialized.`);
  }

  handleConnection(client: Socket) {
    const { user } = client.decoded;
    this.eventsService.addUser(user, client.id);
  }

  handleDisconnect(client: Socket) {
    const { user } = client.decoded;
    this.eventsService.removeUser(user.id);
  }

  @SubscribeMessage('message')
  handleMessage(
    @MessageBody() data: unknown,
    @ConnectedSocket() client: Socket,
  ): Uint8Array {
    return this.eventsService.makeAckResp();
  }
}
