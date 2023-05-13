"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const handleErrorAsync_1 = __importDefault(require("../../service/handleErrorAsync"));
const user_1 = __importDefault(require("../../controllers/member/user"));
const auth_1 = require("../../middleware/auth");
const image_1 = __importDefault(require("../../service/image"));
const router = express_1.default.Router();
// 登入
router.post('/login', (0, handleErrorAsync_1.default)(user_1.default.login));
// 註冊
router.post('/register', (0, handleErrorAsync_1.default)(user_1.default.register));
// 登出
router.post('/logout', auth_1.isAuth, (0, handleErrorAsync_1.default)(user_1.default.logout));
// 取得個人資訊
router.get('/profiles', auth_1.isAuth, (0, handleErrorAsync_1.default)(user_1.default.profile));
// 修改個人資訊
router.patch('/profiles', auth_1.isAuth, (0, handleErrorAsync_1.default)(user_1.default.updateProfiles));
// 修改密碼
router.patch('/updatePassword', auth_1.isAuth, (0, handleErrorAsync_1.default)(user_1.default.updatePassword));
// 上傳圖片
router.post('/picture', auth_1.isAuth, image_1.default, (0, handleErrorAsync_1.default)(user_1.default.uploadUserImage));
// (忘記密碼) email 寄信
router.post('/forgot_password', (0, handleErrorAsync_1.default)(user_1.default.forgotPassword));
// (忘記密碼) 修改密碼
router.patch('/reset_password', auth_1.isForgotAuth, (0, handleErrorAsync_1.default)(user_1.default.resetPassword));
// 取得預填資訊
router.get('/pre_filled_info', auth_1.isAuth, (0, handleErrorAsync_1.default)(user_1.default.getPreFilledInfo));
// 修改預填資訊
router.put('/pre_filled_info', auth_1.isAuth, (0, handleErrorAsync_1.default)(user_1.default.updatePreFilledInfo));
exports.default = router;
