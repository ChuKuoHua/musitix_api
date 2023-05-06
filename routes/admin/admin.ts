import express from 'express';
import handleErrorAsync from '../../service/handleErrorAsync';
import { isAdmin } from '../../middleware/admin';
import adminControllers from '../../controllers/admin/admin';
import upload from '../../service/image';

const router = express.Router();
// 登入
router.post('/login', handleErrorAsync(adminControllers.login));
// 註冊
router.post('/register', handleErrorAsync(adminControllers.register));
// 登出
router.post('/logout', isAdmin, handleErrorAsync(adminControllers.logout));
// 取得個人資訊
router.get('/profiles', isAdmin, handleErrorAsync(adminControllers.profile));
// 修改個人資訊
router.patch('/profiles', isAdmin, handleErrorAsync(adminControllers.updateProfiles));
// 修改密碼
router.patch('/updatePassword', isAdmin, handleErrorAsync(adminControllers.updatePassword));
// 上傳圖片
router.post('/picture', isAdmin, upload, handleErrorAsync(adminControllers.uploadUserImage));
// 作廢主辦
router.delete('/deleteHost/:id', handleErrorAsync(adminControllers.deleteHost));
export default router;