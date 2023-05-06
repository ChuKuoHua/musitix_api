import express from 'express';
import handleErrorAsync from '../../service/handleErrorAsync';
import { isAdmin } from '../../middleware/admin';
import memberControllers from '../../controllers/admin/memberManage';

const router = express.Router();

// 全部會員資料
router.get('/users_list', isAdmin, handleErrorAsync(memberControllers.usersList));
// 會員停用/啟用
router.delete('/invalid_user', isAdmin, handleErrorAsync(memberControllers.invalidUser));

router.delete('/delete_user', isAdmin, handleErrorAsync(memberControllers.deleteUser));

export default router;