import { Module } from '@nestjs/common';
import { EventsService } from './events.service';
import { ProtoService } from 'src/proto/proto.service';
import { EventsGateway } from './events.gateway';

@Module({
  providers: [EventsService, ProtoService, EventsGateway],
})
export class EventsModule {}
