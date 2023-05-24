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
const express_1 = __importDefault(require("express"));
const passport_1 = __importDefault(require("passport"));
const passport_google_oauth20_1 = require("passport-google-oauth20");
const handleErrorAsync_1 = __importDefault(require("../../service/handleErrorAsync"));
const googleAuth_1 = __importDefault(require("../../controllers/member/googleAuth"));
const usersModel_1 = __importDefault(require("../../models/usersModel"));
// google驗證策略設定
passport_1.default.use(new passport_google_oauth20_1.Strategy({
    clientID: process.env.GOOGLE_AUTH_CLIENTID,
    clientSecret: process.env.GOOGLE_AUTH_CLIENT_SECRET,
    callbackURL: process.env.BACKEND_BASE_URL + `/google/redirect`
}, function (accessToken, refreshToken, profile, cb) {
    var _a;
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const user = yield usersModel_1.default.findOrCreateWithGoogle({
                googleId: profile.id,
                username: (_a = profile._json.name) !== null && _a !== void 0 ? _a : '新用戶',
                email: profile.emails[0].value,
                picture: profile._json.picture
            });
            return cb(null, user);
        }
        catch (err) {
            return cb(err);
        }
    });
}));
const router = express_1.default.Router();
// 導向Google登入頁面
router.get('/', passport_1.default.authenticate('google', {
    scope: ['email', 'profile']
}));
// 重新導向到前台
router.get('/redirect', (0, handleErrorAsync_1.default)(googleAuth_1.default.redirect));
// Google登入callback
router.get('/callback', passport_1.default.authenticate('google', { session: false }), (0, handleErrorAsync_1.default)(googleAuth_1.default.loginWithGoogle));
exports.default = router;
