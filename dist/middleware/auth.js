"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const jwt = require('jsonwebtoken');
const appError = require('../service/appError');
const handleErrorAsync = require('../service/handleErrorAsync');
const User = require('../models/users');
const isAuth = handleErrorAsync((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    // 確認 token 是否存在
    let token;
    if (req.headers.authorization &&
        req.headers.authorization.startsWith('Bearer')) {
        token = req.headers.authorization.split(' ')[1];
    }
    const isLogin = req.session.isLogin;
    if (!token && !isLogin || isLogin === undefined) {
        return next(appError(401, '你尚未登入！', next));
    }
    // 驗證 token 正確性
    const decoded = yield new Promise((resolve, reject) => {
        jwt.verify(token, process.env.JWT_SECRET, (err, payload) => {
            if (err) {
                reject(err);
            }
            else {
                resolve(payload);
            }
        });
    });
    const currentUser = yield User.findById(decoded.id);
    req.user = currentUser;
    next();
}));
const generateSendJWT = (user, statusCode, res) => {
    // 產生 JWT token
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_DAY
    });
    user.password = undefined;
    res.status(statusCode).json({
        status: 'success',
        user: {
            token,
            username: user.username,
            picture: user.picture // 個人頭像
        }
    });
};
module.exports = {
    isAuth,
    generateSendJWT
};
