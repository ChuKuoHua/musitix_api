import { Request, Response, NextFunction } from 'express';
import { AuthRequest, imageRequest } from '../../models/otherModel';
import { Profiles } from '../../models/usersModel';
import appError from '../../service/appError';
import handleSuccess from '../../service/handleSuccess';
import { checkPwd } from '../../service/checkError';
import { GetSignedUrlConfig, GetSignedUrlCallback } from '@google-cloud/storage';
import { generateSendAdminJWT } from '../../middleware/admin';
import Host from '../../models/hostModel';
import bcrypt from 'bcryptjs';
import validator from 'validator';
import firebaseAdmin from '../../middleware/firebase';
import { v4 as uuidv4 } from 'uuid';
import redisClient from '../../connections/connectRedis';

// 引入上傳圖片會用到的套件
const bucket = firebaseAdmin.storage().bucket();
const admin = {
  // NOTE 登入
  async login(req:AuthRequest, res: Response, next: NextFunction) {
    const { account, password } = req.body;
    if (!account || !password) {
      return appError( 400,'帳號或密碼錯誤',next);
    }
    const host = await Host.findOne(
      {
        account,
        isDisabled: false, // false 啟用 true 停用
      },
    ).select('+password');

    if(!host) {
      return appError( 401,'無此主辦帳號',next);
    }

    const auth = await bcrypt.compare(password, host.password);

    if(!auth){
      return appError(400,'您的密碼不正確',next);
    }

    generateSendAdminJWT(host, 200, res);
  },
  // NOTE 註冊
  async register(req: AuthRequest, res: Response, next: NextFunction) {
    let { email, account, username, password, confirmPassword } = req.body;
    const errorMsg = []

    // 檢查信箱是否已使用
    const adminCheck = await Host.findOne({
      "email": email
    })
    if(adminCheck) {
      return appError(400,"此 Email 已使用",next);
    }

    // 內容不可為空
    if(!email||!account||!username||!password||!confirmPassword){
      return appError(400, "欄位未填寫正確！", next);
    }
    // 是否為 Email
    if(!validator.isEmail(email)){
      errorMsg.push("Email 格式不正確")
    }

    // 密碼檢查
    const pwdError = checkPwd(password, confirmPassword)
    if(pwdError) {
      errorMsg.push(pwdError)
    }
    // 確認密碼
    if(password !== confirmPassword){
      errorMsg.push("密碼不一致");
    }

    if(errorMsg.length > 0) {
      return appError(400, errorMsg, next);
    }
    
    // 加密密碼
    password = await bcrypt.hash(req.body.password,12);
    const newAdmin = await Host.create({
      email,
      account,
      password,
      username,
      role: 'host'
    });
    generateSendAdminJWT(newAdmin, 201, res);
  },
  // NOTE 登出
  async logout(req: AuthRequest, res:Response) {
    // await Host.findByIdAndUpdate(req.admin.id,
    //   {
    //     token: ''
    //   }
    // );
    await redisClient.del(req.admin.id)
    handleSuccess(res, '已登出')
  },
  // NOTE 取得主辦資料
  async profile(req: AuthRequest, res:Response) {
    const { username, picture, email } = req.admin

    const data = {
      email,
      username,
      picture
    }

    handleSuccess(res, data);
  },
  // NOTE 更新主辦資料
  async updateProfiles (req: AuthRequest, res: Response, next: NextFunction) {
    const { username, picture } = req.body;
    const updateData = {} as Profiles;
    if(!username) {
      // errorMsg.push("暱稱不得為空值");
      return appError("400", '暱稱不得為空值', next);
    }
    // 判斷是否有上傳圖片
    if(picture) {
      updateData.picture = picture
    }
    updateData.username = username
    
    await Host.findByIdAndUpdate(req.admin.id, {
      $set: updateData
    })
    handleSuccess(res, '修改成功')
  },

  // NOTE 上傳主辦圖片
  async uploadUserImage (req: imageRequest, res:Response, next: NextFunction) {
    if(!req.files || !req.files.length) {
      return appError(400, "尚未上傳檔案", next);
    }
    // 取得上傳的檔案資訊列表裡面的第一個檔案
    const file = req.files[0];
    // 基於檔案的原始名稱建立一個 blob 物件
    const blob = bucket.file(`images/user/${uuidv4()}.${file.originalname.split('.').pop()}`);
    // 建立一個可以寫入 blob 的物件
    const blobStream = blob.createWriteStream()

    // 監聽上傳狀態，當上傳完成時，會觸發 finish 事件
    blobStream.on('finish', () => {
      // 設定檔案的存取權限
      const config: GetSignedUrlConfig = {
        action: 'read', // 權限
        expires: '12-31-2500', // 網址的有效期限
      };
      const callback: GetSignedUrlCallback = (err: Error | null, fileUrl?: string) => {
        return handleSuccess(res, fileUrl);
      };
      // 取得檔案的網址
      blob.getSignedUrl(config, callback);
    });

    // 如果上傳過程中發生錯誤，會觸發 error 事件
    blobStream.on('error', (err: Error) => {
      return appError("500", '上傳失敗', next);
    });

    // 將檔案的 buffer 寫入 blobStream
    blobStream.end(file.buffer);
  },
  // 更新密碼
  async updatePassword (req: AuthRequest, res:Response, next: NextFunction) {
    let { password, newPassword, confirmPassword } = req.body;
    const hostId = req.admin.id
    const host = await Host.findOne(
      {
        hostId
      },
    ).select('+password');
    if(host) {
      const auth = await bcrypt.compare(password, host.password);
      if(!auth){
        return appError(400, '原密碼不正確', next);
      }
      if(!newPassword) {
        return appError(400, '請輸入新密碼', next);
      }
      if(password === newPassword) {
        return appError(400, '新密碼不可與原密碼相同', next);
      }
      const errorMsg = []
      // 密碼檢查
      const pwdError = checkPwd(newPassword, confirmPassword)
      if(pwdError) {
        errorMsg.push(pwdError)
      }

      if(errorMsg.length > 0) {
        return appError(400, errorMsg, next);
      }
      newPassword = await bcrypt.hash(newPassword, 12);
      
      await Host.findByIdAndUpdate(req.admin.id,
        {
          password: newPassword
        }
      );

      handleSuccess(res, '密碼已修改');
    }
  },
  // 主辦刪除
  async deleteHost (req: Request, res:Response, next: NextFunction) {
    await Host.deleteOne({id: req.params.id});
    handleSuccess(res, '已刪除');
  }
}

export default admin;