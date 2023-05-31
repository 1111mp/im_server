import { HttpStatus } from '@nestjs/common';

declare global {
  namespace IMServerResponse {
    const enum StatusCode {
      Success = 200,
      BadRequest = 400,
      Unauthorized = 401,
      Forbidden = 403,
      Timeout = 408,
      ServerError = 500,

      UnprocesableEntity = 422,
    }

    interface JsonResponse<T> {
      statusCode: HttpStatus;
      message?: string;
      data?: T;
    }

    interface AckResponse {
      statusCode: HttpStatus;
      message?: string;
    }
  }
}
