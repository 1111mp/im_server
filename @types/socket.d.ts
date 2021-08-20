import { Socket } from "socket.io";

declare module "http" {
  interface IncomingHttpHeaders {
    token: string;
    userid: string;
  }
}

declare module "socket.io" {
  interface Socket {
    decoded: {
      userId: number;
    };
  }
}
