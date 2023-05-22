import express from 'express';
import handleErrorAsync from '../../service/handleErrorAsync';
import { isAdmin } from '../../middleware/admin';
import memberControllers from '../../controllers/admin/memberManage';

const router = express.Router();

// 全部會員資料
router.get('/users_list', isAdmin, handleErrorAsync(memberControllers.usersList));
// TODO 會員購票紀錄
router.get('/:id/ticket_record', isAdmin, handleErrorAsync(memberControllers.ticketRecord));
// 會員停用/啟用
router.delete('/invalid_user', isAdmin, handleErrorAsync(memberControllers.invalidUser));
// 刪除會員(後端用)
router.delete('/delete_user', isAdmin, handleErrorAsync(memberControllers.deleteUser));

export default router;