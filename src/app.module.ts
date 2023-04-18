import { Module } from '@nestjs/common';
import { APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { SequelizeModule } from '@nestjs/sequelize';
import { BullModule } from '@nestjs/bull';
import { MulterModule } from '@nestjs/platform-express';

import { redisModule } from './common/redis/redis.config';
import { EventsModule } from './events/events.module';
import { LoggerModule } from './common/logger/logger.module';
import { PermissionModule } from './common/permission/permission.module';
import { UsersModule } from './api/users/users.module';
import { FriendsModule } from './api/friends/friends.module';
import { GroupsModule } from './api/groups/groups.module';
import { ElectronModule } from './api/electron/electron.module';

import { RolesGuard } from './common/permission/guards/roles.guard';
import { JwtAuthGuard } from './common/auth/guards/jwt-auth.guard';
import { CacheApiInterceptor } from './common/cache/interceptors/cache.interceptor';

const envFilePath = ['.env'];
if (process.env.NODE_ENV === 'dev') {
  envFilePath.unshift('.env.dev');
} else {
  envFilePath.unshift('.env.prod');
}

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath,
    }),
    SequelizeModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        dialect: 'mariadb',
        host: configService.get('DB_HOST') || '127.0.0.1',
        port: configService.get<number>('DB_PORT'),
        username: configService.get('DB_USER'),
        password: configService.get('DB_PASS'),
        database: configService.get('DB_NAME'),
        pool: {
          min: 0,
          max: 5,
          acquire: 30000,
          idle: 10000,
        },
        timezone: '+08:00',
        define: {
          charset: 'utf8',
        },
        dialectOptions: {
          // collate: "utf8_general_ci",
        },
        autoLoadModels: true,
        synchronize: true,
      }),
      inject: [ConfigService],
    }),
    redisModule,
    BullModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        redis: {
          host: configService.get('REDIS_HOST'),
          port: configService.get('REDIS_PORT'),
          // username: configService.get('REDIS_USERNAME'),
          // password: configService.get('REDIS_PWD'),
          db: configService.get('REDIS_DB'),
        },
      }),
      inject: [ConfigService],
    }),
    MulterModule.registerAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        dest: configService.get('MULTER_DEST'),
      }),
      inject: [ConfigService],
    }),
    LoggerModule,
    PermissionModule,
    EventsModule,
    UsersModule,
    FriendsModule,
    GroupsModule,
    ElectronModule,
  ],
  providers: [
    { provide: APP_GUARD, useClass: JwtAuthGuard },
    {
      provide: APP_GUARD,
      useClass: RolesGuard,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: CacheApiInterceptor,
    },
  ],
})
export class ApplicationModule {}
