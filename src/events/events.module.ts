import { Global, Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { BullModule } from '@nestjs/bull';

import { EventsController } from './events.controller';
import { Message } from './models/message.model';
import { MessageAck } from './models/message-ack.model';
import { MessageRead } from './models/message-read.model';
import { Notify } from './models/notify.model';
import { GroupsModule } from 'src/api/groups/groups.module';
import { EventsService } from './events.service';
import { ProtoService } from 'src/common/proto/proto.service';
import { EventsGateway } from './events.gateway';
import { IMQueueName } from './constants';
import { MulterModule } from '@nestjs/platform-express';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Global()
@Module({
  imports: [
    SequelizeModule.forFeature([Message, MessageAck, MessageRead, Notify]),
    BullModule.registerQueueAsync({
      name: IMQueueName,
    }),
    MulterModule.registerAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        dest: configService.get('MULTER_DEST'),
      }),
      inject: [ConfigService],
    }),
    GroupsModule,
  ],
  controllers: [EventsController],
  providers: [EventsService, ProtoService, EventsGateway],
  exports: [EventsService],
})
export class EventsModule {}
