import { Request, Response, NextFunction } from 'express';

import appError from '../../service/appError';
import { generateSendJWT } from '../../middleware/auth';
import { IUser, Profiles } from '../../models/usersModel';

const googleAuth = {
  // 導向前台登入頁，帶有code資訊
  async redirect(req: Request, res: Response, next: NextFunction) {
    res.redirect(process.env.FRONTEND_BASE_URL + '/#/login?googleAuthCode=' + req.query.code);
  },

  async loginWithGoogle(req: Request, res: Response, next: NextFunction) {
    const user = req.user as IUser;

    if (!user || user.isDisabled) {
      return appError(401, '無此會員或已停用', next);
    }

    const profiles: Profiles = {
      _id: user._id,
      username: user.username
    }

    generateSendJWT(profiles, 200, res);
  }
};

export default googleAuth;
