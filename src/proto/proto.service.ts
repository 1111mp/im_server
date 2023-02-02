import { Injectable } from '@nestjs/common';
import { AckMessage } from './source/proto';

@Injectable()
export class ProtoService {
  public setAckToProto(resp: IMServerResponse.AckResponse) {
    const message = new AckMessage(resp);
    return AckMessage.encode(message).finish();
  }

  public getAckFromProto(buffer: Uint8Array) {
    return AckMessage.decode(buffer);
  }
}
