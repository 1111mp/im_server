import type { Request } from 'express';

declare global {
  namespace IMServerRequest {
    interface RequestForHeader extends Request {
      headers: {
        userid?: string;
        authorization?: string;
      };
    }

    interface RequestForContext extends Request {
      user: User.UserInfo;
    }

    interface RequestForAuthed extends RequestForContext, RequestForHeader {}
  }
}
