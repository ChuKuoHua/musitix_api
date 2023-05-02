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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// import { Session } from 'express-session';
const appError_1 = __importDefault(require("../../service/appError"));
const handleSuccess_1 = __importDefault(require("../../service/handleSuccess"));
const checkError_1 = require("../../service/checkError");
const admin_1 = require("../../middleware/admin");
const users_1 = __importDefault(require("../../models/users"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const validator_1 = __importDefault(require("validator"));
const admin = {
    // NOTE 登入
    login(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            const { account, password } = req.body;
            if (!account || !password) {
                return next((0, appError_1.default)(400, '帳號或密碼錯誤', next));
            }
            const user = yield users_1.default.findOne({
                account,
                isDisabled: false,
                role: "host"
            }).select('+password');
            if (!user) {
                return next((0, appError_1.default)(401, '權限不足', next));
            }
            const auth = yield bcryptjs_1.default.compare(password, user.password);
            if (!auth) {
                return next((0, appError_1.default)(400, '您的密碼不正確', next));
            }
            (0, admin_1.generateSendAdminJWT)(user, 200, res);
        });
    },
    // NOTE 註冊
    register(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            let { email, account, username, password, confirmPassword } = req.body;
            const errorMsg = [];
            // 檢查信箱是否已使用
            const adminCheck = yield users_1.default.findOne({
                "email": email,
                "role": "host"
            });
            if (adminCheck) {
                return next((0, appError_1.default)(400, "此 Email 已使用", next));
            }
            // 內容不可為空
            if (!email || !account || !username || !password || !confirmPassword) {
                return next((0, appError_1.default)(400, "欄位未填寫正確！", next));
            }
            // 是否為 Email
            if (!validator_1.default.isEmail(email)) {
                errorMsg.push("Email 格式不正確");
            }
            // 密碼檢查
            const pwdError = (0, checkError_1.checkPwd)(password, confirmPassword);
            if (pwdError) {
                errorMsg.push(pwdError);
            }
            // 確認密碼
            if (password !== confirmPassword) {
                errorMsg.push("密碼不一致");
            }
            if (errorMsg.length > 0) {
                return next((0, appError_1.default)(400, errorMsg, next));
            }
            // 加密密碼
            password = yield bcryptjs_1.default.hash(req.body.password, 12);
            const newAdmin = yield users_1.default.create({
                email,
                account,
                password,
                username,
                role: 'host'
            });
            (0, admin_1.generateSendAdminJWT)(newAdmin, 201, res);
        });
    },
    // NOTE 登出
    logout(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            yield users_1.default.findByIdAndUpdate(req.admin.id, {
                token: ''
            });
            (0, handleSuccess_1.default)(res, '已登出');
        });
    },
};
exports.default = admin;
