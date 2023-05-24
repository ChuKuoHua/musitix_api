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
const appError_1 = __importDefault(require("../../service/appError"));
const auth_1 = require("../../middleware/auth");
const googleAuth = {
    // 導向前台登入頁，帶有code資訊
    redirect(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            res.redirect(process.env.ClientBackURL + '/#/login?googleAuthCode=' + req.query.code);
        });
    },
    loginWithGoogle(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            const user = req.user;
            if (!user || user.isDisabled) {
                return (0, appError_1.default)(401, '無此會員或已停用', next);
            }
            const profiles = {
                _id: user._id,
                username: user.username
            };
            (0, auth_1.generateSendJWT)(profiles, 200, res);
        });
    }
};
exports.default = googleAuth;
