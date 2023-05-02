"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const handleErrorAsync_1 = __importDefault(require("../../service/handleErrorAsync"));
const admin_1 = require("../../middleware/admin");
const memberManage_1 = __importDefault(require("../../controllers/admin/memberManage"));
const router = express_1.default.Router();
// 全部會員資料
router.get('/users_list', admin_1.isAdmin, (0, handleErrorAsync_1.default)(memberManage_1.default.usersList));
// 會員停用/啟用
router.delete('/invalid_user', admin_1.isAdmin, (0, handleErrorAsync_1.default)(memberManage_1.default.invalidUser));
router.delete('/clear_user', admin_1.isAdmin, (0, handleErrorAsync_1.default)(memberManage_1.default.clearUser));
exports.default = router;
