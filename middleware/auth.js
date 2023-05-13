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
exports.generateSendJWT = exports.isForgotAuth = exports.isAuth = void 0;
const appError_1 = __importDefault(require("../service/appError"));
const handleErrorAsync_1 = __importDefault(require("../service/handleErrorAsync"));
const users_1 = __importDefault(require("../models/users"));
const connectRedis_1 = __importDefault(require("../connections/connectRedis"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const isAuth = (0, handleErrorAsync_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    // 確認 token 是否存在
    let token;
    if (req.headers.authorization &&
        req.headers.authorization.startsWith('Bearer')) {
        token = req.headers.authorization.split(' ')[1];
    }
    if (!token) {
        return next((0, appError_1.default)(401, '你尚未登入！', next));
    }
    // 驗證 token 正確性
    const decoded = yield new Promise((resolve, reject) => {
        jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET, (err, payload) => {
            if (err) {
                reject(err);
            }
            else {
                resolve(payload);
            }
        });
    });
    const session = yield connectRedis_1.default.get(decoded.id).then((res) => {
        return res;
    });
    if (!session) {
        return next((0, appError_1.default)(401, '你尚未登入！', next));
    }
    const currentUser = yield users_1.default.findById(decoded.id);
    if (currentUser !== null) {
        // if(!currentUser.token) {
        //   return next(appError(401, '你尚未登入！', next));
        // }
        req.user = {
            id: currentUser._id.toString(),
            email: currentUser.email,
            username: currentUser.username,
            picture: (_a = currentUser.picture) !== null && _a !== void 0 ? _a : null,
        };
    }
    else {
        return next((0, appError_1.default)(401, '無效的 token', next));
    }
    next();
}));
exports.isAuth = isAuth;
const isForgotAuth = (0, handleErrorAsync_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _b;
    // 確認 token 是否存在
    let token;
    if (req.headers.authorization &&
        req.headers.authorization.startsWith('Bearer')) {
        token = req.headers.authorization.split(' ')[1];
    }
    if (!token) {
        return next((0, appError_1.default)(401, '查無會員', next));
    }
    // 驗證 token 正確性
    const decoded = yield new Promise((resolve, reject) => {
        jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET, (err, payload) => {
            if (err) {
                reject(err);
            }
            else {
                resolve(payload);
            }
        });
    });
    const currentUser = yield users_1.default.findById(decoded.id);
    if (currentUser !== null) {
        req.user = {
            id: currentUser._id.toString(),
            email: currentUser.email,
            username: currentUser.username,
            picture: (_b = currentUser.picture) !== null && _b !== void 0 ? _b : null,
        };
    }
    else {
        return next((0, appError_1.default)(401, '無效的 token', next));
    }
    next();
}));
exports.isForgotAuth = isForgotAuth;
const generateSendJWT = (user, statusCode, res) => __awaiter(void 0, void 0, void 0, function* () {
    // 產生 JWT token
    const token = jsonwebtoken_1.default.sign({
        id: user._id,
    }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_DAY
    });
    const second = 24 * 60 * 60;
    const day = process.env.REDIS_EXPIRES_DAY ? Number(process.env.REDIS_EXPIRES_DAY) : 30;
    connectRedis_1.default.set(user._id.toString(), token, {
        EX: second * day,
    });
    // await User.findByIdAndUpdate(user._id,
    //   {
    //     token: token
    //   }
    // );
    res.status(statusCode).json({
        message: '成功',
        user: {
            token,
            username: user.username,
            picture: user.picture // 個人頭像
        }
    });
});
exports.generateSendJWT = generateSendJWT;
