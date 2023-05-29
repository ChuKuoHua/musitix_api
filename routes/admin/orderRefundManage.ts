import express from 'express';
import handleErrorAsync from '../../service/handleErrorAsync';
import { isAdmin } from '../../middleware/admin';
import activityManage from '../../controllers/admin/activityManage';

const router = express.Router();

// 取得退票資料(內容)
router.get('/:id', isAdmin, handleErrorAsync(activityManage.getUserOrderRefund));

export default router;
