
export class ApiResponse {

  timestamp: string;
  data: any;
  path: string;
  status: number;
  error: string | null;
  method: string;
  message: string;
  
  constructor(status: any, path: any, method: any, message: any, data: any, error: any) {
    this.timestamp = new Date().toISOString();
    this.data = data;
    this.path = path;
    this.status = status;
    this.error = error; 
    this.method = method;
    this.message = message;
  }
}
