"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const handleErrorAsync_1 = __importDefault(require("../../service/handleErrorAsync"));
const admin_1 = require("../../middleware/admin");
const adminManage_1 = __importDefault(require("../../controllers/admin/adminManage"));
const image_1 = __importDefault(require("../../service/image"));
const router = express_1.default.Router();
// 登入
router.post('/login', (0, handleErrorAsync_1.default)(adminManage_1.default.login));
// 註冊
router.post('/register', (0, handleErrorAsync_1.default)(adminManage_1.default.register));
// 登出
router.post('/logout', admin_1.isAdmin, (0, handleErrorAsync_1.default)(adminManage_1.default.logout));
// 取得個人資訊
router.get('/profiles', admin_1.isAdmin, (0, handleErrorAsync_1.default)(adminManage_1.default.profile));
// 修改個人資訊
router.patch('/profiles', admin_1.isAdmin, (0, handleErrorAsync_1.default)(adminManage_1.default.updateProfiles));
// 修改密碼
router.patch('/updatePassword', admin_1.isAdmin, (0, handleErrorAsync_1.default)(adminManage_1.default.updatePassword));
// 上傳圖片
router.post('/picture', admin_1.isAdmin, image_1.default, (0, handleErrorAsync_1.default)(adminManage_1.default.uploadUserImage));
// 刪除主辦
router.delete('/deleteHost/:id', (0, handleErrorAsync_1.default)(adminManage_1.default.deleteHost));
exports.default = router;
