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
    picture: string | null;
  };
  admin: {
    id: string;
    role: string
    email: string;
    username: string;
    picture: string | null;
  };
  password: string | undefined;
  username: string;
  picture: string;
  session: Session & {
    isLogin: boolean;
    email: string;
    username: string;
    picture: string | null;
  }
}

export interface searchRequest extends Request {
  query: {
    timeSort: string;
    search: string;
    disabled: string;
    page: string;
    limit: string;
  }
}

export interface imageRequest extends Request {
  files: Express.Multer.File[];
}

export interface DocFromGoogle {
  googleId: string,
  username: string,
  email: string,
  picture?: string
}
