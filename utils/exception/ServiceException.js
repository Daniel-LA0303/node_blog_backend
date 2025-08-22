export class ServiceException extends Error {
  constructor(message, status = 400, extra = {}) {
    super(message);
    this.name = "ServiceException";
    this.status = status;
    this.extra = extra; // cualquier información adicional que quieras pasar
    Error.captureStackTrace(this, this.constructor);
  }
}
