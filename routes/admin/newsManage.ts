import express from 'express';
import handleErrorAsync from '../../service/handleErrorAsync';
import { isAdmin } from '../../middleware/admin';
import activityManage from '../../controllers/admin/activityManage';

const router = express.Router();

// 最新消息資料(內容) by id
router.get('/news/:id', isAdmin, handleErrorAsync(activityManage.getNewsById));

// 最新消息資料(內容)
router.get('/news_list', isAdmin, handleErrorAsync(activityManage.getAllNews));

// 新增 最新消息
router.post('/news', isAdmin, handleErrorAsync(activityManage.createNews));

// 編輯 最新消息
router.patch('/news/:id', isAdmin, handleErrorAsync(activityManage.updateNews));

// 刪除 最新消息
router.delete('/news/:id', isAdmin, handleErrorAsync(activityManage.deleteNews));

export default router;
