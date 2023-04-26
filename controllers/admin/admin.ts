import { Response, NextFunction } from 'express';
import { AuthRequest } from '../../models/other';
import { Session } from 'express-session';
import appError from '../../service/appError';
import handleSuccess from '../../service/handleSuccess';
import checkPwd from '../../service/pwdCheckError';
import { generateSendAdminJWT } from '../../middleware/admin';
import User from '../../models/users';
import bcrypt from 'bcryptjs';
import validator from 'validator';

const admin = {
  // NOTE 登入
  async login(req:AuthRequest, res: Response, next: NextFunction) {
    const { account, password } = req.body;
    if (!account || !password) {
      return next(appError( 400,'帳號或密碼錯誤',next));
    }
    const user = await User.findOne(
      {
        account,
        isDisabled: false, // false 啟用 true 停用
        role: "host"
      },
    ).select('+password');
    if(!user) {
      return next(appError( 401,'權限不足',next));
    }
    const auth = await bcrypt.compare(password, user.password);
    if(!auth){
      return next(appError(400,'您的密碼不正確',next));
    }
    
    req.session.role = user.role
    req.session.isLogin = true;
    generateSendAdminJWT(user, 200, res);
  },
  // NOTE 註冊
  async register(req: AuthRequest, res: Response, next: NextFunction) {
    let { email, account, username, password, confirmPassword } = req.body;
    const errorMsg = []

    // 檢查信箱是否已使用
    const adminCheck = await User.findOne({
      "email": email,
      "role": "host"
    })
    if(adminCheck) {
      return next(appError(400,"此 Email 已使用",next));
    }

    // 內容不可為空
    if(!email||!account||!username||!password||!confirmPassword){
      return next(appError(400, "欄位未填寫正確！", next));
    }
    // 是否為 Email
    if(!validator.isEmail(email)){
      errorMsg.push("Email 格式不正確")
    }

    // 密碼檢查
    const pwdError = checkPwd(password)
    if(pwdError) {
      errorMsg.push(pwdError)
    }
    // 確認密碼
    if(password !== confirmPassword){
      errorMsg.push("密碼不一致");
    }

    if(errorMsg.length > 0) {
      return next(appError(400, errorMsg, next));
    }
    
    // 加密密碼
    password = await bcrypt.hash(req.body.password,12);
    const newAdmin = await User.create({
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
    req.session.destroy(():void => {}) as Session & {};
    handleSuccess(res, '已登出')
  },
}

export default admin;