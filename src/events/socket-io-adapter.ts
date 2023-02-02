import { INestApplicationContext, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { IoAdapter } from '@nestjs/platform-socket.io';
import { Server, ServerOptions, Socket } from 'socket.io';
import { RedisService } from 'src/redis/redis.service';

export class SocketIOAdapter extends IoAdapter {
  private readonly logger = new Logger(SocketIOAdapter.name);

  constructor(
    private app: INestApplicationContext,
    private configService: ConfigService,
  ) {
    super(app);
  }

  createIOServer(port: number, options?: ServerOptions) {
    const clientPort = parseInt(this.configService.get('PORT'));

    const cors = {
      origin: [`http://127.0.0.1:${clientPort}`],
    };

    this.logger.log('Configuring SocketIO server with custom CORS options', {
      cors,
    });

    const optionsWithCORS: ServerOptions = {
      ...options,
      cors,
    };

    const server: Server = super.createIOServer(port, optionsWithCORS);

    const jwtService = this.app.get(JwtService);
    const redisService = this.app.get(RedisService);
    server
      .use(createTokenMiddleware(redisService, jwtService, this.logger))
      .of('socket/v1/IM')
      .use(createTokenMiddleware(redisService, jwtService, this.logger));

    return server;
  }
}

const createTokenMiddleware =
  (redisService: RedisService, jwtService: JwtService, logger: Logger) =>
  async (socket: Socket, next: (err?: Error) => void) => {
    const { userid, authorization } = socket.handshake.headers;

    if (!userid || !authorization)
      return next(new Error('Authentication error'));

    logger.debug(
      `Validating auth token before connection: [authorization] ${authorization} [userid] ${userid}`,
    );

    const auth_key = `${process.env.USER_AUTH_KEY}::${userid}`;
    const token = await redisService
      .getRedisClient()
      .hGet(auth_key, authorization);

    if (!token) return next(new Error('Authentication error'));

    try {
      const payload = jwtService.verify(token) as User.UserInfo;
      socket.decoded = { user: payload };
      next();
    } catch (err) {
      next(new Error('Authentication error'));
    }
  };
