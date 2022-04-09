declare namespace Response {
  // https://stackoverflow.com/questions/40227401/const-enum-in-typescript/40227546#40227546
  const enum StatusCode {
    Success = 200,
    BadRequest = 400,
    Unauthorized = 401,
    Forbidden = 403,
    Timeout = 408,
    ServerError = 500,

    UnprocesableEntity = 422,
  }
}
