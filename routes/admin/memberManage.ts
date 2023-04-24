import express from 'express';

const router = express.Router();
const handleErrorAsync = require('../../service/handleErrorAsync');
const memberControllers = require('../../controllers/admin/memberManage');
const {isAdmin} = require('../../middleware/admin');

// 全部會員資料
router.get('/users_list', isAdmin, handleErrorAsync(memberControllers.usersList));
// 會員停用/啟用
router.delete('/invalid_user', isAdmin, handleErrorAsync(memberControllers.invalidUser));

module.exports = router;