import express from 'express';
import handleErrorAsync from '../../service/handleErrorAsync';
import userControllers from '../../controllers/member/user';
import { isAuth } from '../../middleware/auth';
import upload from '../../service/image';

const router = express.Router();
// 登入
router.post('/login', handleErrorAsync(userControllers.login));
// 註冊
router.post('/register', handleErrorAsync(userControllers.register));
// 登出
router.post('/logout', isAuth, handleErrorAsync(userControllers.logout));
// 取得個人資訊
router.get('/profiles', isAuth, handleErrorAsync(userControllers.profile));
// 修改個人資訊
router.patch('/profiles', isAuth, handleErrorAsync(userControllers.updateProfiles));
// 修改密碼
router.patch('/updatePassword', isAuth, handleErrorAsync(userControllers.updatePassword));
// 上傳圖片
router.post('/picture', isAuth, upload, handleErrorAsync(userControllers.uploadUserImage));

export default router;