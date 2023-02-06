import { Global, Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { Notify } from './models/notify.model';
import { EventsService } from './events.service';
import { ProtoService } from 'src/common/proto/proto.service';
import { EventsGateway } from './events.gateway';

@Global()
@Module({
  imports: [SequelizeModule.forFeature([Notify])],
  providers: [EventsService, ProtoService, EventsGateway],
  exports: [EventsService, EventsGateway],
})
export class EventsModule {}
