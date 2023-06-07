import express from 'express';
import handleErrorAsync from '../../service/handleErrorAsync';
import latestNews from '../../controllers/member/news';

const router = express.Router();

// 最新消息
router.get('/', handleErrorAsync(latestNews.getLatestNews));

export default router;
