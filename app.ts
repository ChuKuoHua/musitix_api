
import express from 'express';
import notFound from "./service/notFound";

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
const { resErrorAll } = require('./middleware/resError');
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

// 404 路由
app.use(notFound);

// 錯誤處理
app.use(resErrorAll);

module.exports = app;
