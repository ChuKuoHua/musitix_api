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
const handleSuccess = require('../../service/handleSuccess');
const { generateSendAdminJWT } = require('../../middleware/admin');
const appError = require('../../service/appError');
const User = require('../../models/users');
const bcrypt = require('bcryptjs');
const validator = require('validator');
const checkPwd = require('../../service/pwdCheckError');
const admin = {
    // NOTE 登入
    login(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            const { account, password } = req.body;
            if (!account || !password) {
                return next(appError(400, '帳號或密碼錯誤', next));
            }
            const user = yield User.findOne({
                account,
                isDisabled: false,
                role: "host"
            }).select('+password');
            if (!user) {
                return next(appError(401, '權限不足', next));
            }
            const auth = yield bcrypt.compare(password, user.password);
            if (!auth) {
                return next(appError(400, '您的密碼不正確', next));
            }
            req.session.role = user.role;
            req.session.isLogin = true;
            generateSendAdminJWT(user, 200, res);
        });
    },
    // NOTE 註冊
    register(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            let { email, account, username, password, confirmPassword } = req.body;
            const errorMsg = [];
            // 檢查信箱是否已使用
            const adminCheck = yield User.findOne({
                "email": email,
                "role": "host"
            });
            if (adminCheck) {
                return next(appError(400, "此 Email 已使用", next));
            }
            // 內容不可為空
            if (!email || !account || !username || !password || !confirmPassword) {
                return next(appError(400, "欄位未填寫正確！", next));
            }
            // 是否為 Email
            if (!validator.isEmail(email)) {
                errorMsg.push("Email 格式不正確");
            }
            // 密碼檢查
            const pwdError = checkPwd(password);
            if (pwdError) {
                errorMsg.push(pwdError);
            }
            // 確認密碼
            if (password !== confirmPassword) {
                errorMsg.push("密碼不一致");
            }
            if (errorMsg.length > 0) {
                return next(appError(400, errorMsg, next));
            }
            // 加密密碼
            password = yield bcrypt.hash(req.body.password, 12);
            const newAdmin = yield User.create({
                email,
                account,
                password,
                username,
                role: 'host'
            });
            generateSendAdminJWT(newAdmin, 201, res);
        });
    },
    // NOTE 登出
    logout(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            req.session.destroy(() => { });
            handleSuccess(res, '已登出');
        });
    },
};
module.exports = admin;
