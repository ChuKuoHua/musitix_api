import express from 'express';

const router = express.Router();
const handleErrorAsync = require('../../service/handleErrorAsync');
const userControllers = require('../../controllers/admin/admin');
const {isAdmin} = require('../../middleware/admin');

// 登入
router.post('/login', handleErrorAsync(userControllers.login));
// 註冊
router.post('/register', handleErrorAsync(userControllers.register));
// 登出
router.post('/logout', isAdmin, handleErrorAsync(userControllers.logout));

module.exports = router;