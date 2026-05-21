
export class ServiceException extends Error {

  status: number;

  extra: Record<string, unknown>;

  constructor(message: any, status = 400, extra = {}) {
    super(message);
    this.name = "ServiceException";
    this.status = status;
    this.extra = extra; // cualquier información adicional que quieras pasar
    Error.captureStackTrace(this, this.constructor);
  }
}
