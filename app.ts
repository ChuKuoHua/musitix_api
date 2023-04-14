
import express, { Request, Response, NextFunction } from 'express';
import { IError } from "./models/error";

// 套件
var createError = require('http-errors');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const cors = require('cors');

// 資料庫連線
require('./connections');
// 伺服器錯誤
require('./middleware/processError');

// route
const indexRouter = require('./routes/index');
const usersRouter = require('./routes/users');
const { resErrorProd, resErrorDev } = require('./middleware/resError');
// express
const app = express();

// view engine setup
// app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(cors());
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// route
app.use('/', indexRouter);
app.use('/users', usersRouter);

// 處理無此路由
app.use(function (req: Request, res: Response, next: NextFunction) {
  res.status(404).send({
    status: 'error',
    massage: '無此路由'
  })
});

// 錯誤處理
app.use(function(err: IError, req: Request, res: Response, next: NextFunction) {
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
});

module.exports = app;
