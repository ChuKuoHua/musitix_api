import express from 'express';
import handleErrorAsync from '../../service/handleErrorAsync';
import { isAdmin } from '../../middleware/admin';
import adminControllers from '../../controllers/admin/admin';

const router = express.Router();

// 登入
router.post('/login', handleErrorAsync(adminControllers.login));
// 註冊
router.post('/register', handleErrorAsync(adminControllers.register));
// 登出
router.post('/logout', isAdmin, handleErrorAsync(adminControllers.logout));

export default router;