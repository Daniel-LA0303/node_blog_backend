
export class ApiResponse {
  constructor(status, path, method, message, data, error) {
    this.timestamp = new Date().toISOString();
    this.data = data;
    this.path = path;
    this.status = status;
    this.error = error; 
    this.method = method;
    this.message = message;
  }
}
