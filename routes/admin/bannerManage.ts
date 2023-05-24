import express from 'express';
import handleErrorAsync from '../../service/handleErrorAsync';
import { isAdmin } from '../../middleware/admin';
import bannerControllers from '../../controllers/admin/bannerManage';
const router = express.Router();
// 圖片 table
router.get('/list', isAdmin, handleErrorAsync(bannerControllers.bannerList));
// 取得所有活動圖片
router.get('/info', isAdmin, handleErrorAsync(bannerControllers.activityAllImage));
// 新增
router.post('/', isAdmin, handleErrorAsync(bannerControllers.addBanner));
// 刪除
router.delete('/:id', isAdmin, handleErrorAsync(bannerControllers.deleteBanner));

export default router;