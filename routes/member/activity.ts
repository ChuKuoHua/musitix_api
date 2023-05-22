import express from 'express';
import handleErrorAsync from '../../service/handleErrorAsync';
import activityController from '../../controllers/member/activity';
import newebpay from '../../controllers/member/newebpay';
import { isAuth } from '../../middleware/auth';

const router = express.Router();

// 熱門活動, 即將開賣, 近期活動
router.get('/', handleErrorAsync(activityController.getPublishedActivities));

//活動搜尋
router.get('/search', handleErrorAsync(activityController.searchActivities));

//活動詳細介紹
router.get('/:id', handleErrorAsync(activityController.getActivityById));

// 根據場次id取得相關資訊
router.get('/schedule/:scheduleId', handleErrorAsync(activityController.getScheduleInfoById));

//送出訂票資訊
router.post('/:id/booking', isAuth, handleErrorAsync(activityController.bookingActivity));

// TODO 藍新金流導回頁面
// router.post('/spgateway_return', handleErrorAsync(newebpay.newebpayReturn));
// TODO 交易成功後，處理訂單狀態
router.post('/spgateway_notify', handleErrorAsync(newebpay.newebpayNotify));

export default router;
