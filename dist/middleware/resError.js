"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// express 錯誤處理
// 自訂 err 錯誤
const resErrorProd = (err, res, code) => {
    if (err.isOperational) {
        res.status(code).send({
            message: err.message
        });
    }
    else {
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
const resErrorDev = (err, res, code) => {
    res.status(code).send({
        message: err.message,
        error: err,
        stack: err.stack
    });
};
// 錯誤處理
const resErrorAll = (err, req, res, next) => {
    const code = err.statusCode ? Number(err.statusCode) : 500;
    // 驗證 token
    if (err.message === 'invalid signature') {
        return res.status(code).send({
            status: 'error',
            message: '你尚未登入！'
        });
    }
    else if (err.message === 'invalid token') {
        return res.status(code).send({
            status: 'error',
            message: '無效的 token'
        });
    }
    // dev
    if (process.env.NODE_ENV === 'dev') {
        return resErrorDev(err, res, code);
    }
    // production
    if (err.name === 'ValidationError') {
        err.message = "資料欄位未填寫正確，請重新輸入！";
        err.isOperational = true;
        return resErrorProd(err, res, code);
    }
    resErrorProd(err, res, code);
};
module.exports = { resErrorProd, resErrorDev, resErrorAll };
