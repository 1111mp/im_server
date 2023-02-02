import { HttpStatus, Injectable } from '@nestjs/common';
import { ProtoService } from 'src/proto/proto.service';

@Injectable()
export class EventsService {
  private users: Map<number, User.UserInfo & { socketId: string }>;

  constructor(private readonly protoService: ProtoService) {
    this.users = new Map();
  }

  public addUser(user: User.UserInfo, id: string) {
    this.users.set(user.id, { ...user, socketId: id });
  }

  public removeUser(userid: number) {
    this.users.delete(userid);
  }

  public makeAckResp() {
    return this.protoService.setAckToProto({
      statusCode: HttpStatus.OK,
      message: 'Successed.',
    });
  }
}
