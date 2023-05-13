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
exports.generateSendAdminJWT = exports.isAdmin = void 0;
const appError_1 = __importDefault(require("../service/appError"));
const handleErrorAsync_1 = __importDefault(require("../service/handleErrorAsync"));
const host_1 = __importDefault(require("../models/host"));
const connectRedis_1 = __importDefault(require("../connections/connectRedis"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const isAdmin = (0, handleErrorAsync_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
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
    const currentUser = yield host_1.default.findById(decoded.id);
    if (currentUser !== null) {
        // if(!currentUser.token) {
        //   return next(appError(401,'你尚未登入！',next));
        // }
        req.admin = {
            id: currentUser._id.toString(),
            email: currentUser.email,
            username: currentUser.username,
            picture: (_a = currentUser.picture) !== null && _a !== void 0 ? _a : null,
            role: currentUser.role
        };
    }
    else {
        return next((0, appError_1.default)(401, '無效的 token', next));
    }
    if (((_b = req.admin) === null || _b === void 0 ? void 0 : _b.role) && req.admin.role !== 'host') {
        return next((0, appError_1.default)(401, '此帳號權限不足', next));
    }
    next();
}));
exports.isAdmin = isAdmin;
const generateSendAdminJWT = (host, statusCode, res) => __awaiter(void 0, void 0, void 0, function* () {
    // 產生 JWT token
    const token = jsonwebtoken_1.default.sign({ id: host._id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_DAY
    });
    const second = 24 * 60 * 60;
    const day = process.env.REDIS_EXPIRES_DAY ? Number(process.env.REDIS_EXPIRES_DAY) : 30;
    connectRedis_1.default.set(host._id.toString(), token, {
        EX: second * day,
    });
    // await Host.findByIdAndUpdate(host._id,
    //   {
    //     token: token
    //   }
    // );
    res.status(statusCode).json({
        message: '成功',
        user: {
            token,
            username: host.username,
            picture: host.picture // 個人頭像
        }
    });
});
exports.generateSendAdminJWT = generateSendAdminJWT;
