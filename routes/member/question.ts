import express from 'express';
import handleErrorAsync from '../../service/handleErrorAsync';
import questionController from '../../controllers/member/question';

const router = express.Router();

// 新增問題
router.post('/', handleErrorAsync(questionController.post));

export default router;
