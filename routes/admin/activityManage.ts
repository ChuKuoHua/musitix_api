import express from 'express';

import handleErrorAsync from '../../service/handleErrorAsync';
import { isAdmin } from '../../middleware/admin';
import activityManage from '../../controllers/admin/activityManage';
import upload from '../../service/image';

const router = express.Router();

// 建立活動
router.post('/', isAdmin, handleErrorAsync(activityManage.createActivity));

// 編輯活動
router.patch('/:id', isAdmin, handleErrorAsync(activityManage.updateActivity));

// 上架活動
router.post('/:id/publish', isAdmin, handleErrorAsync(activityManage.publishActivity));

// 取消活動
router.post('/:id/cancel', isAdmin, handleErrorAsync(activityManage.cancelActivity));

// 上傳圖片(活動用)
router.post('/upload_image', isAdmin, upload, handleErrorAsync(activityManage.uploadActivityImage));

// 活動資料(內容)
router.get('/', isAdmin, handleErrorAsync(activityManage.getAllActivities));

// 活動資料(內容)by id
router.get('/:id', isAdmin, handleErrorAsync(activityManage.getActivityById));

// 活動入場 qrcode
router.post('/:ticketId/qrcode', isAdmin, handleErrorAsync(activityManage.admittanceQrcode));
export default router;
