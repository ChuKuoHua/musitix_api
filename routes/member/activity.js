"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const handleErrorAsync_1 = __importDefault(require("../../service/handleErrorAsync"));
const activity_1 = __importDefault(require("../../controllers/member/activity"));
const router = express_1.default.Router();
// 熱門活動, 即將開賣, 近期活動
router.get('/', (0, handleErrorAsync_1.default)(activity_1.default.getPublishedActivities));
//活動搜尋
router.get('/search', (0, handleErrorAsync_1.default)(activity_1.default.searchActivities));
//活動詳細介紹
router.get('/:id', (0, handleErrorAsync_1.default)(activity_1.default.getActivityById));
// 根據場次id取得相關資訊
router.get('/schedule/:scheduleId', (0, handleErrorAsync_1.default)(activity_1.default.getScheduleInfoById));
//送出訂票資訊
//router.post('/:id/booking', isAuth, handleErrorAsync(activityController.bookingActivity));
exports.default = router;
