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
    statusCode: number;
    message?: string;
    token?: string;
    data?: T;
  }
}
