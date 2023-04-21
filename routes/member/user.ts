import express from 'express';

const router = express.Router();
const handleErrorAsync = require('../../service/handleErrorAsync');
const userControllers = require('../../controllers/member/user');
const {isAuth} = require('../../middleware/auth');

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

module.exports = router;