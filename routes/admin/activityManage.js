"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const handleErrorAsync_1 = __importDefault(require("../../service/handleErrorAsync"));
const admin_1 = require("../../middleware/admin");
const activityManage_1 = __importDefault(require("../../controllers/admin/activityManage"));
const image_1 = __importDefault(require("../../service/image"));
const router = express_1.default.Router();
// 建立活動
router.post('/', admin_1.isAdmin, (0, handleErrorAsync_1.default)(activityManage_1.default.createActivity));
// 編輯活動
router.patch('/:id', admin_1.isAdmin, (0, handleErrorAsync_1.default)(activityManage_1.default.updateActivity));
// 上架活動
router.post('/:id/publish', admin_1.isAdmin, (0, handleErrorAsync_1.default)(activityManage_1.default.publishActivity));
// 取消活動
router.post('/:id/cancel', admin_1.isAdmin, (0, handleErrorAsync_1.default)(activityManage_1.default.cancelActivity));
// 上傳圖片(活動用)
router.post('/upload_image', admin_1.isAdmin, image_1.default, (0, handleErrorAsync_1.default)(activityManage_1.default.uploadActivityImage));
// 活動資料(內容)
router.get('/', admin_1.isAdmin, (0, handleErrorAsync_1.default)(activityManage_1.default.getAllActivities));
// 活動資料(內容)by id
router.get('/:id', admin_1.isAdmin, (0, handleErrorAsync_1.default)(activityManage_1.default.getActivityById));
// 活動入場 qrcode
router.post('/:ticketId/qrcode', admin_1.isAdmin, (0, handleErrorAsync_1.default)(activityManage_1.default.admittanceQrcode));
exports.default = router;
