import express from 'express';
import handleErrorAsync from '../../service/handleErrorAsync';
import activityController from '../../controllers/member/activity';
import { isAuth } from '../../middleware/auth';

const router = express.Router();

// 熱門活動, 即將開賣, 近期活動
router.get('/', handleErrorAsync(activityController.getPublishedActivities));

// TODO 
// 活動搜尋
// router.get('/search', handleErrorAsync(activityController.XXXXXX));

// TODO
// 活動詳細介紹
// router.get('/:id', handleErrorAsync(activityController.XXXXXX));

// TODO
// 送出訂票資訊
// router.post('/:id/booking', isAuth, handleErrorAsync(activityController.XXXXXX));


export default router;
