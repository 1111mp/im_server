import { Socket } from "socket.io";

export interface SessionSocket extends Socket {
  decoded: {
    userId: number;
  };
}
