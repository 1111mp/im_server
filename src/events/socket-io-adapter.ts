import { INestApplicationContext, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { IoAdapter } from '@nestjs/platform-socket.io';
import { AuthService } from 'src/common/auth/auth.service';

import type { Server, ServerOptions, Socket } from 'socket.io';

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
      origin: [
        `http://127.0.0.1:${clientPort}`,
        `http://127.0.0.1:1212`,
        'http://localhost:1212',
      ],
    };

    this.logger.log('Configuring SocketIO server with custom CORS options', {
      cors,
    });

    const optionsWithCORS: ServerOptions = {
      ...options,
      cors,
      path: '/socket/v1/IM/',
    };

    const server: Server = super.createIOServer(port, optionsWithCORS);

    const authService = this.app.get(AuthService);

    server.use(createTokenMiddleware(authService, this.logger));

    return server;
  }
}

const createTokenMiddleware =
  (authService: AuthService, logger: Logger) =>
  async (socket: Socket, next: (err?: Error) => void) => {
    console.log(socket.handshake.headers);
    const { userid, authorization } = socket.handshake.headers;
    console.log(userid);

    if (!userid || !authorization)
      return next(new Error('Authentication error'));

    logger.debug(
      `Validating auth token before connection: [authorization] ${authorization} [userid] ${userid}`,
    );

    const token = await authService.getToken(userid, authorization);

    if (!token) return next(new Error('Authentication error'));

    try {
      const payload = authService.verifyToken(token);
      socket.decoded = { user: payload };
      next();
    } catch (err) {
      next(new Error('Authentication error'));
    }
  };
