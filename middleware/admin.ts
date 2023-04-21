import { Response, NextFunction } from 'express';
import { ISession, Payload, AuthRequest } from "../models/other";

const jwt = require('jsonwebtoken');
const appError = require('../service/appError'); 
const handleErrorAsync = require('../service/handleErrorAsync');
const User = require('../models/users');
const isAdmin = handleErrorAsync(async (req:AuthRequest, res: Response, next:NextFunction) => {
  // 確認 token 是否存在
  let token: string | null | undefined;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }

  const isLogin: boolean | undefined = (req.session as ISession).isLogin;
  if (!token && !isLogin || isLogin === undefined) {
    return next(appError(401,'你尚未登入！',next));
  }
  // 驗證 token 正確性
  const decoded = await new Promise<Payload>((resolve, reject) => {
    jwt.verify(token,process.env.JWT_SECRET!, (err: Error, payload: Payload) => {
      if(err){
        reject(err)
      }else{
        resolve(payload)
      }
    })
  })
  
  const currentUser = await User.findById(decoded.id);
  
  req.admin = currentUser;
  if(req.admin?.role && req.admin.role !== 'host') {
    return next(appError(401,'此帳號權限不足',next));
  }
  
  next();
});

const generateSendAdminJWT = (user: AuthRequest, statusCode: number, res: Response) => {
  // 產生 JWT token
  const token = jwt.sign({id:user._id},process.env.JWT_SECRET,{
    expiresIn: process.env.JWT_EXPIRES_DAY
  });
  user.password = undefined;
  res.status(statusCode).json({
    status: 'success',
    user:{
      token,
      username: user.username, // 暱稱
    }
  });
} 

module.exports = {
  isAdmin,
  generateSendAdminJWT
}