
import express from 'express';
import notFound from "./service/notFound";
import { resErrorAll } from './middleware/resError';
import path from 'path';
// 套件
import createError from 'http-errors';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import logger from 'morgan';

// 資料庫連線
require('./connections');
// 伺服器錯誤
require('./middleware/processError');
const swaggerUi = require('swagger-ui-express')
const swaggerFile = require('./swagger_output.json')
const MongoStore = require('connect-mongo');

// route
import indexRouter from './routes/index';
import userRouter from './routes/member/user';
import adminRouter from './routes/admin/admin';
import activityManageRouter from './routes/admin/activityManage';
import memberManageRouter from './routes/admin/memberManage';

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
app.use('/api-doc', swaggerUi.serve, swaggerUi.setup(swaggerFile))
// route
// 前台
app.use('/', indexRouter);
app.use('/api/users', userRouter);

// 後台
app.use('/admin', adminRouter)
app.use('/admin/users_mgmt', memberManageRouter)
app.use('/admin/activities', activityManageRouter)

// 404 路由
app.use(notFound);

// 錯誤處理
app.use(resErrorAll);

module.exports = app;
