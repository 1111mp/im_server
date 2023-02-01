import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { ConfigModule } from '@nestjs/config';
import { SequelizeModule } from '@nestjs/sequelize';
import { UsersModule } from './users/users.module';
import { PermissionModule } from './permission/permission.module';
import { JwtAuthGuard } from './auth/guards/jwt-auth.guard';
import { RolesGuard } from './permission/guards/roles.guard';
import { LoggerModule } from './logger/logger.module';

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
    UsersModule,
    PermissionModule,
    LoggerModule,
  ],
  providers: [
    { provide: APP_GUARD, useClass: JwtAuthGuard },
    {
      provide: APP_GUARD,
      useClass: RolesGuard,
    },
  ],
})
export class ApplicationModule {}
