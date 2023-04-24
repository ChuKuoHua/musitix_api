
import express from 'express';
import notFound from "./service/notFound";

// 套件
const createError = require('http-errors');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const cors = require('cors');

// 資料庫連線
require('./connections');
// 伺服器錯誤
require('./middleware/processError');

// route
const indexRouter = require('./routes/index');
const userRouter = require('./routes/member/user');
const adminRouter = require('./routes/admin/admin');
const memberManageRouter = require('./routes/admin/memberManage');
const { resErrorAll } = require('./middleware/resError');
const session = require('express-session');
const MongoStore = require('connect-mongo');
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

// 使用 session
app.use(session({
  secret: 'keyTokeId',
  // 保存 session 值
  resave: true,
  // 無論有無 session cookie，每次請求都設置 session cookie
  // 默認為 connect.sid
  saveUninitialized: true,
  // 當 secure 為 true 時，cookie 在 HTTP 中是無效，在 HTTPS 中才有效
  cookie: ({ secure: false }),
  store: new MongoStore({
    mongoUrl: process.env.DATABASE,
    ttl: 7 * 60 * 60 * 24, // 會話過期時間為 7 天
  }),
}));

// route
// 前台
app.use('/', indexRouter);
app.use('/api/users', userRouter);

// 後台
app.use('/admin', adminRouter)
app.use('/admin/users_mgmt', memberManageRouter)

// 404 路由
app.use(notFound);

// 錯誤處理
app.use(resErrorAll);

module.exports = app;
