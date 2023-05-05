import express from 'express';
import handleErrorAsync from '../../service/handleErrorAsync';
import userControllers from '../../controllers/member/user';
import { isAuth } from '../../middleware/auth';
import upload from '../../service/image';

const router = express.Router();

// 登入
router.post('/login', handleErrorAsync(
  /**
    #swagger.tags = ['會員']
    #swagger.description = '會員登入'
    #swagger.parameters['parameter_name'] = {
        in: 'body',
        schema: {
          email: '信箱',
          password: '密碼'
        }
    } 
    #swagger.responses[200] = {
      "description": "會員資訊"
    }
    #swagger.responses[400] = {
      "description": "帳號或密碼錯誤 / 密碼錯誤"
    }
    #swagger.responses[401] = {
      "description": "無此會員或已停用"
    }
  */
  userControllers.login
));

// 註冊
router.post('/register', handleErrorAsync(
  /**
    #swagger.tags = ['會員']
    #swagger.description = '會員註冊'
    #swagger.parameters['parameter_name'] = {
        in: 'body',
        schema: {
          email: '信箱',
          username: '暱稱',
          password: '密碼'
        }
    } 
    #swagger.responses[201] = {
      "description": "註冊成功"
    }
    #swagger.responses[400] = {
      "description": "此暱稱已被使用 / 此 Email 已使用 / 欄位未填寫正確！"
    }
  */
  userControllers.register
));
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