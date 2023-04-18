import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { SequelizeModule } from '@nestjs/sequelize';
import { ElectronController } from './electron.controller';
import { ElectronService } from './electron.service';
import { Electron as ElectronModel } from './models/electron.model';

@Module({
  imports: [ConfigModule, SequelizeModule.forFeature([ElectronModel])],
  controllers: [ElectronController],
  providers: [ElectronService],
})
export class ElectronModule {}
