
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

// route
import indexRouter from './routes/index';
import userRouter from './routes/member/user';
import bannerRouter from './routes/member/banner';
import activityRouter from './routes/member/activity';
import questionRouter from './routes/member/question';
import googleAuthRouter from './routes/member/googleAuth';
import adminRouter from './routes/admin/adminManage';
import activityManageRouter from './routes/admin/activityManage';
import memberManageRouter from './routes/admin/memberManage';
import bannerManageRouter from './routes/admin/bannerManage';
import latestNews from './routes/member/latestnews';

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
// 前台
app.use('/', indexRouter);
app.use('/google', googleAuthRouter);
app.use('/api/users', userRouter);
app.use('/api/activities', activityRouter);
app.use('/api/questions', questionRouter);
app.use('/api/banner_about', bannerRouter);
app.use('/api/news', latestNews);

// 後台
app.use('/admin', adminRouter);
app.use('/admin/users_mgmt', memberManageRouter);
app.use('/admin', activityManageRouter);
app.use('/admin/banner_mgmt', bannerManageRouter);
// 404 路由
app.use(notFound);

// 錯誤處理
app.use(resErrorAll);

module.exports = app;
