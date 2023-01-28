import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ApplicationModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(ApplicationModule);
  app.setGlobalPrefix('api/v1');

  const configService = app.get(ConfigService);
  const port = configService.get('PORT');

  const options = new DocumentBuilder()
    .setTitle('for-nestjs')
    .setDescription('The description for api.')
    .setVersion('1.0.0')
    .addServer('http://127.0.0.1:3000')
    .addServer('https://127.0.0.1:3000')
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