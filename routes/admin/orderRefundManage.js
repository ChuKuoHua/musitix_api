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
// 取得待審核的退票訂單列表
router.get('/orders_list', admin_1.isAdmin, (0, handleErrorAsync_1.default)(activityManage_1.default.getUserOrderRefundList));
// 取得退票資料(內容)
router.get('/:id', admin_1.isAdmin, (0, handleErrorAsync_1.default)(activityManage_1.default.getUserOrderRefund));
exports.default = router;
