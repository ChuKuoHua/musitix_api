import { Response } from 'express';
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

module.exports = { resErrorProd, resErrorDev }