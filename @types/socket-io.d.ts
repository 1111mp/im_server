import { Socket } from 'socket.io';

declare module 'http' {
  interface IncomingHttpHeaders {
    authorization: string;
    userid: string;
  }
}

declare module 'socket.io' {
  interface Socket {
    decoded: {
      user: User.UserInfo;
    };
  }
}
