import { Injectable } from '@nestjs/common';
import { AckMessage, Notify, MessageText, MessageImage } from './source/proto';

@Injectable()
export class ProtoService {
  public setAckToProto(resp: IMServerResponse.AckResponse) {
    const message = new AckMessage(resp);
    return AckMessage.encode(message).finish();
  }

  public getAckFromProto(buffer: Uint8Array) {
    return AckMessage.decode(buffer);
  }

  public setNotifyToProto(notify: ModuleIM.Core.Notify) {
    const message = new Notify(notify);
    return Notify.encode(message).finish();
  }

  public getNotifyFromProto(buffer: Uint8Array) {
    return Notify.decode(buffer);
  }

  public setMessageTextToProto(messageText: ModuleIM.Core.MessageText) {
    const message = new MessageText(messageText);
    return MessageText.encode(message).finish();
  }

  public getMessageTextFromProto(buffer: Uint8Array) {
    return MessageText.decode(buffer);
  }

  public setMessageImageToProto(messageText: ModuleIM.Core.MessageText) {
    const message = new MessageImage(messageText);
    return MessageImage.encode(message).finish();
  }

  public getMessageImageFromProto(buffer: Uint8Array) {
    return MessageImage.decode(buffer);
  }
}
