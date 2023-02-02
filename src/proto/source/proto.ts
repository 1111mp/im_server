import { HttpStatus } from '@nestjs/common';
import { Message, Type, Field, OneOf } from 'protobufjs/light';

@Type.d('SuperAckMessage')
export class AckMessage extends Message<AckMessage> {
  @Field.d(1, 'int32', 'required', HttpStatus.OK)
  public statusCode: HttpStatus;

  @Field.d(2, 'string', 'optional')
  public message: string;
}
