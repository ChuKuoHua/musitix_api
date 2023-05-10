import { Response, NextFunction } from 'express';
import { Payload, AuthRequest } from '../models/other';
import appError from '../service/appError';
import handleErrorAsync from '../service/handleErrorAsync';
import { Profiles } from '../models/users';
import Host from '../models/host';
import redisClient from '../connections/connectRedis';

const jwt = require('jsonwebtoken');
const isAdmin = handleErrorAsync(async (req: AuthRequest, res: Response, next:NextFunction) => {
  // 確認 token 是否存在
  let token: string | null | undefined;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return next(appError(401, '你尚未登入！', next));
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

  const session = await redisClient.get(decoded.id).then((res: string | null) => {
    return res
  })
  
  if(!session) {
    return next(appError(401, '你尚未登入！', next));
  }

  const currentUser = await Host.findById(decoded.id);
  if (currentUser !== null) {
    // if(!currentUser.token) {
    //   return next(appError(401,'你尚未登入！',next));
    // }
    req.admin = {
      id: currentUser._id.toString(),
      email: currentUser.email,
      username: currentUser.username,
      picture: currentUser.picture ?? null,
      role: currentUser.role
    };
  } else {
    return next(appError(401, '無效的 token', next));
  }
  
  if(req.admin?.role && req.admin.role !== 'host') {
    return next(appError(401,'此帳號權限不足',next));
  }

  next();
});

const generateSendAdminJWT = async (host: Profiles, statusCode: number, res: Response) => {
  // 產生 JWT token
  const token = jwt.sign({id:host._id},process.env.JWT_SECRET,{
    expiresIn: process.env.JWT_EXPIRES_DAY
  });

  const second: number = 24 * 60 * 60;
  const day: number = process.env.REDIS_EXPIRES_DAY ? Number(process.env.REDIS_EXPIRES_DAY) : 30;
  
  redisClient.set(host._id.toString(), token, {
    EX: second * day,
  });
  // await Host.findByIdAndUpdate(host._id,
  //   {
  //     token: token
  //   }
  // );
  host.password = undefined;
  res.status(statusCode).json({
    message: '成功',
    user:{
      token,
      username: host.username, // 暱稱
      picture: host.picture // 個人頭像
    }
  });
} 

export {
  isAdmin,
  generateSendAdminJWT
}