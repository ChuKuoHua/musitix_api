import express from 'express';
import handleErrorAsync from '../../service/handleErrorAsync';
import userControllers from '../../controllers/member/user';
import { isAuth, isForgotAuth } from '../../middleware/auth';
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
// (忘記密碼) email 寄信
router.post('/forgot_password', handleErrorAsync(userControllers.forgotPassword));
// (忘記密碼) 修改密碼
router.patch('/reset_password', isForgotAuth, handleErrorAsync(userControllers.resetPassword));
// 取得預填資訊
router.get('/pre_filled_info', isAuth, handleErrorAsync(userControllers.getPreFilledInfo));
// 修改預填資訊
router.put('/pre_filled_info', isAuth, handleErrorAsync(userControllers.updatePreFilledInfo));
// 取得訂單資訊
router.get('/order_info/:id', isAuth, handleErrorAsync(userControllers.getOrderInfo));
// 取得我的票券
router.get('/ticket_record', isAuth, handleErrorAsync(userControllers.getOrderList));
// 取消我的訂單
router.delete('/order/:id', isAuth, handleErrorAsync(userControllers.deleteOrder));
// 取得訂單所有的QRcode狀態(只取狀態)
router.get('/order_qrcode/:id', isAuth, handleErrorAsync(userControllers.getOrderQRcodeStatus));
// 使用者是否已設定密碼
router.get('/pw_existed', isAuth, handleErrorAsync(userControllers.getPasswordExisted));
export default router;
