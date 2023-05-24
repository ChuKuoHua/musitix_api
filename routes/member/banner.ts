import express from 'express';
import handleErrorAsync from '../../service/handleErrorAsync';
import bannerController from '../../controllers/member/banner';

const router = express.Router();

// 新增問題
router.get('/', handleErrorAsync(bannerController.getBanner));

export default router;
