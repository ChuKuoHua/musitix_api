"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const handleErrorAsync_1 = __importDefault(require("../../service/handleErrorAsync"));
const admin_1 = require("../../middleware/admin");
const bannerManage_1 = __importDefault(require("../../controllers/admin/bannerManage"));
const router = express_1.default.Router();
// 圖片 table
router.get('/list', admin_1.isAdmin, (0, handleErrorAsync_1.default)(bannerManage_1.default.bannerList));
// 取得所有活動圖片
router.get('/info', admin_1.isAdmin, (0, handleErrorAsync_1.default)(bannerManage_1.default.activityAllImage));
// 新增
router.post('/', admin_1.isAdmin, (0, handleErrorAsync_1.default)(bannerManage_1.default.addBanner));
// 刪除
router.delete('/:id', admin_1.isAdmin, (0, handleErrorAsync_1.default)(bannerManage_1.default.deleteBanner));
exports.default = router;
