import { Request } from 'express';
import { Session } from 'express-session';

export interface ISession extends Session {
  isLogin: boolean;
  role: string;
}

export interface Payload {
  id: string;
}

export interface AuthRequest extends Request {
  _id: string;
  user: {
    id: string;
    email: string;
    username: string;
    picture: string;
  };
  admin: {
    role: string
  };
  password: string | undefined;
  username: string;
  picture: string;
  session: Session & {
    isLogin: boolean;
    role: string;
  }
}

export interface searchRequest extends Request {
  query: {
    timeSort: string;
    q: string;
  }
}