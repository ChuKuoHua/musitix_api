"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const handleErrorAsync_1 = __importDefault(require("../../service/handleErrorAsync"));
const admin_1 = require("../../middleware/admin");
const activityManage_1 = __importDefault(require("../../controllers/admin/activityManage"));
const router = express_1.default.Router();
// 最新消息資料(內容) by id
router.get('/news/:id', admin_1.isAdmin, (0, handleErrorAsync_1.default)(activityManage_1.default.getNewsById));
// 最新消息資料(內容)
router.get('/news_list', admin_1.isAdmin, (0, handleErrorAsync_1.default)(activityManage_1.default.getAllNews));
// 新增 最新消息
router.post('/news', admin_1.isAdmin, (0, handleErrorAsync_1.default)(activityManage_1.default.createNews));
// 編輯 最新消息
router.patch('/news/:id', admin_1.isAdmin, (0, handleErrorAsync_1.default)(activityManage_1.default.updateNews));
// 刪除 最新消息
router.delete('/news/:id', admin_1.isAdmin, (0, handleErrorAsync_1.default)(activityManage_1.default.deleteNews));
exports.default = router;
