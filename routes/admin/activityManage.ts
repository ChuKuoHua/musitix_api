import express from 'express';

import handleErrorAsync from '../../service/handleErrorAsync';
import { isAdmin } from '../../middleware/admin';
import activityManage from '../../controllers/admin/activityManage';
import upload from '../../service/image';

const router = express.Router();

// 建立活動
router.post('/activities/', isAdmin, handleErrorAsync(activityManage.createActivity));

// 編輯活動
router.patch('/activities/:id', isAdmin, handleErrorAsync(activityManage.updateActivity));

// 上架活動
router.post('/activities/:id/publish', isAdmin, handleErrorAsync(activityManage.publishActivity));

// 取消活動
router.post('/activities/:id/cancel', isAdmin, handleErrorAsync(activityManage.cancelActivity));

// 上傳圖片(活動用)
router.post('/activities/upload_image', isAdmin, upload, handleErrorAsync(activityManage.uploadActivityImage));

// 活動資料(內容)
router.get('/activities', isAdmin, handleErrorAsync(activityManage.getAllActivities));

// 活動資料(內容)by id
router.get('/activities/:id', isAdmin, handleErrorAsync(activityManage.getActivityById));

// 活動入場 qrcode
router.post('/activities/:ticketId/qrcode', isAdmin, handleErrorAsync(activityManage.admittanceQrcode));

// 最新消息資料(內容) by id
router.get('/news_mgmt/news/:id', handleErrorAsync(activityManage.getNewsById));

// 最新消息資料(內容)
router.get('/news_mgmt/news_list', handleErrorAsync(activityManage.getAllNews));

// 新增 最新消息
router.post('/news_mgmt/news', handleErrorAsync(activityManage.createNews));

// 編輯 最新消息
router.patch('/news_mgmt/news/:id', handleErrorAsync(activityManage.updateNews));

// 刪除 最新消息
router.delete('/news_mgmt/news/:id', handleErrorAsync(activityManage.deleteNews));

// 取得退票資料(內容)
router.get('/ticket_mgmt/order/:id', handleErrorAsync(activityManage.getUserOrderRefund));

export default router;
