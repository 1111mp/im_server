import { Injectable } from '@nestjs/common';
import {
  AckMessage,
  Notify,
  MessageForSender,
  MessageForReceiver,
  // MessageTextForSender,
  // MessageTextForReceived,
  // MessageImageForSender,
  // MessageImageForReceived,
  MessageRead,
} from './source/proto';

@Injectable()
export class ProtoService {
  public setAckToProto(resp: IMServerResponse.AckResponse) {
    const message = new AckMessage(resp);
    return AckMessage.encode(message).finish();
  }

  public getAckFromProto(buffer: Uint8Array) {
    return AckMessage.decode(buffer).toJSON() as IMServerResponse.AckResponse;
  }

  public setNotifyToProto(notify: ModuleIM.Core.Notify) {
    const message = new Notify(notify);
    return Notify.encode(message).finish();
  }

  public getNotifyFromProto(buffer: Uint8Array) {
    return Notify.decode(buffer).toJSON() as ModuleIM.Core.Notify;
  }

  public setMessageToProto(msg: ModuleIM.Core.MessageBasic) {
    const message = new MessageForSender(msg);
    return MessageForSender.encode(message).finish();
  }

  public getMessageFromProto(buffer: Uint8Array) {
    return MessageForReceiver.decode(
      buffer,
    ).toJSON() as ModuleIM.Core.MessageBasic;
  }

  public setMessageReadToProto(msg: ModuleIM.Core.MessageRead) {
    const message = new MessageRead(msg);
    return MessageRead.encode(message).finish();
  }

  public getMessageReadFromProto(buffer: Uint8Array) {
    return MessageRead.decode(buffer).toJSON() as ModuleIM.Core.MessageRead;
  }
}
