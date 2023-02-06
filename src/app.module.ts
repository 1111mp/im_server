import { Module } from '@nestjs/common';
import { APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { ConfigModule } from '@nestjs/config';
import { SequelizeModule } from '@nestjs/sequelize';

import { redisModule } from './common/redis/redis.config';
import { EventsModule } from './events/events.module';
import { LoggerModule } from './common/logger/logger.module';
import { PermissionModule } from './common/permission/permission.module';
import { UsersModule } from './api/users/users.module';
import { FriendsModule } from './api/friends/friends.module';

import { RolesGuard } from './common/permission/guards/roles.guard';
import { JwtAuthGuard } from './common/auth/guards/jwt-auth.guard';
import { CacheApiInterceptor } from './common/cache/interceptors/cache.interceptor';

let envFilePath = ['.env'];
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
    SequelizeModule.forRoot({
      dialect: 'mariadb',
      host: process.env.DB_HOST || '127.0.0.1',
      port: parseInt(process.env.DB_PORT),
      username: process.env.DB_USER,
      password: process.env.DB_PASS,
      database: process.env.DB_NAME,
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
    redisModule,
    EventsModule,
    LoggerModule,
    PermissionModule,
    UsersModule,
    FriendsModule,
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
