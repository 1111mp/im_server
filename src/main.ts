import { NestFactory } from '@nestjs/core';
import { VersioningType } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ApplicationModule } from './app.module';
import { LoggerService } from './common/logger/logger.service';
import { SocketIOAdapter } from './events/socket-io-adapter';

async function bootstrap() {
  const app = await NestFactory.create(ApplicationModule, {
    bufferLogs: true,
  });

  app.setGlobalPrefix('api');
  app.enableVersioning({
    type: VersioningType.URI,
    prefix: false,
    defaultVersion: 'v1',
  });

  app.enableCors({
    origin: ['http://localhost:1212'],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Accept', 'authorization', 'userid'],
    exposedHeaders: ['authorization', 'userid'],
    maxAge: 60, //指定本次预检请求的有效期，单位为秒。
    credentials: true, //是否允许发送Cookie
  });

  const configService = app.get(ConfigService);
  const port = configService.get('PORT');

  app.useLogger(app.get(LoggerService));
  app.useWebSocketAdapter(new SocketIOAdapter(app, configService));

  const options = new DocumentBuilder()
    .setTitle('for-nestjs')
    .setDescription('The description for api.')
    .setVersion('1.0.0')
    .addServer(`http://127.0.0.1:${port}`)
    .addServer(`https://127.0.0.1:${port}`)
    .addBearerAuth(
      { type: 'apiKey', in: 'header', name: 'authorization' },
      'token',
    )
    .addBearerAuth({ type: 'apiKey', in: 'header', name: 'userid' }, 'userid')
    .build();
  const document = SwaggerModule.createDocument(app, options, {
    operationIdFactory: (_controllerKey: string, methodKey: string) =>
      methodKey,
  });
  SwaggerModule.setup('api/docs', app, document);

  await app.listen(port);
}
bootstrap();
