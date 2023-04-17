import { Response, NextFunction } from 'express';
import { IError } from "../models/error";

// express 錯誤處理
// 自訂 err 錯誤
const resErrorProd = (err: IError, res: Response) => {
  if (err.isOperational) {
    err.statusCode = err.statusCode || 500
    res.status(err.statusCode).send({
      message: err.message
    });
  } else {
    // log 紀錄
    console.error('出現重大錯誤', err);
    // 送出罐頭預設訊息
    res.status(500).send({
      status: 'error',
      message: '系統錯誤，請恰系統管理員'
    });
  }
};
// 開發環境錯誤
const resErrorDev = (err: IError, res: Response) => {
  err.statusCode = err.statusCode || 500
  res.status(err.statusCode).send({
    message: err.message,
    error: err,
    stack: err.stack
  });
};

// 錯誤處理
const resErrorAll = (err: IError, req: Request, res: Response, next: NextFunction) => {
  // dev
  err.statusCode = err.statusCode || 500;
  if (process.env.NODE_ENV === 'dev') {
    return resErrorDev(err, res);
  } 
  // production
  if (err.name === 'ValidationError'){
    err.message = "資料欄位未填寫正確，請重新輸入！"
    err.isOperational = true;
    return resErrorProd(err, res)
  }
  resErrorProd(err, res)
};

module.exports = { resErrorProd, resErrorDev, resErrorAll }