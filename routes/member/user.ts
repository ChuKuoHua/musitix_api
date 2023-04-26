import express from 'express';
import handleErrorAsync from '../../service/handleErrorAsync';
import userControllers from '../../controllers/member/user';
import { isAuth } from '../../middleware/auth';

const router = express.Router();

// 登入
router.post('/login', handleErrorAsync(userControllers.login));
// 註冊
router.post('/register', handleErrorAsync(userControllers.register));
// 登出
router.post('/logout', isAuth, handleErrorAsync(userControllers.logout));
// 取得個人資訊
router.get('/profiles', isAuth, handleErrorAsync(userControllers.profile));
// 修改個人資訊/密碼
router.patch('/profiles', isAuth, handleErrorAsync(userControllers.updateProfiles));
// 修改圖片
router.patch('/picture', isAuth, handleErrorAsync(userControllers.updatePicture));

export default router;