export interface IError extends Error {
  statusCode?: number;
  name: string;
  isOperational?: boolean;
  status?: number
}

export interface HTTPError extends Error {
  syscall: string;
  code: string;
}
