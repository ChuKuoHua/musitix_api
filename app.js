"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const notFound_1 = __importDefault(require("./service/notFound"));
const resError_1 = require("./middleware/resError");
const path_1 = __importDefault(require("path"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const cors_1 = __importDefault(require("cors"));
const morgan_1 = __importDefault(require("morgan"));
// 資料庫連線
require('./connections');
// 伺服器錯誤
require('./middleware/processError');
// route
const index_1 = __importDefault(require("./routes/index"));
const user_1 = __importDefault(require("./routes/member/user"));
const banner_1 = __importDefault(require("./routes/member/banner"));
const activity_1 = __importDefault(require("./routes/member/activity"));
const question_1 = __importDefault(require("./routes/member/question"));
const googleAuth_1 = __importDefault(require("./routes/member/googleAuth"));
const adminManage_1 = __importDefault(require("./routes/admin/adminManage"));
const activityManage_1 = __importDefault(require("./routes/admin/activityManage"));
const memberManage_1 = __importDefault(require("./routes/admin/memberManage"));
const bannerManage_1 = __importDefault(require("./routes/admin/bannerManage"));
const newsManage_1 = __importDefault(require("./routes/admin/newsManage"));
const orderRefundManage_1 = __importDefault(require("./routes/admin/orderRefundManage"));
const latestnews_1 = __importDefault(require("./routes/member/latestnews"));
// express
const app = (0, express_1.default)();
// view engine setup
// app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');
app.use((0, cors_1.default)());
app.use((0, morgan_1.default)('dev'));
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: false }));
app.use((0, cookie_parser_1.default)());
app.use(express_1.default.static(path_1.default.join(__dirname, 'public')));
// route
// 前台
app.use('/', index_1.default);
app.use('/google', googleAuth_1.default);
app.use('/api/users', user_1.default);
app.use('/api/activities', activity_1.default);
app.use('/api/questions', question_1.default);
app.use('/api/banner_about', banner_1.default);
app.use('/api/news', latestnews_1.default);
// 後台
app.use('/admin', adminManage_1.default);
app.use('/admin/users_mgmt', memberManage_1.default);
app.use('/admin/activities', activityManage_1.default);
app.use('/admin/banner_mgmt', bannerManage_1.default);
app.use('/admin/news_mgmt', newsManage_1.default);
app.use('/admin/ticket_mgmt', orderRefundManage_1.default);
// 404 路由
app.use(notFound_1.default);
// 錯誤處理
app.use(resError_1.resErrorAll);
module.exports = app;