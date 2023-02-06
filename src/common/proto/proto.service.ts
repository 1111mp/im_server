import { Injectable } from '@nestjs/common';
import { AckMessage, Notify } from './source/proto';

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
}
