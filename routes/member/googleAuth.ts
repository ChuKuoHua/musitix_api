import express from 'express';
import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';

import handleErrorAsync from '../../service/handleErrorAsync';
import googleAuthControllers from '../../controllers/member/googleAuth';
import User from '../../models/usersModel';

// google驗證策略設定
passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_AUTH_CLIENTID!,
  clientSecret: process.env.GOOGLE_AUTH_CLIENT_SECRET!,
  callbackURL: process.env.BACKEND_BASE_URL + `/google/redirect`
},
  async function (accessToken, refreshToken, profile, cb) {
    try {
      const user = await User.findOrCreateWithGoogle({
        googleId: profile.id,
        username: profile._json.name ?? '新用戶',
        email: profile.emails![0].value,
        picture: profile._json.picture
      });
      return cb(null, user);
    } catch (err: any) {
      return cb(err);
    }
  }
));

const router = express.Router();

// 導向Google登入頁面
router.get('/', function (req, res, next) {
  (passport.authenticate('google', {
    scope: ['email', 'profile'],
    state: JSON.stringify(req.query)
  }))(req, res, next);
});

// 重新導向到前台
router.get('/redirect', handleErrorAsync(googleAuthControllers.redirect));

// Google登入callback
router.get('/callback',
  passport.authenticate('google', { session: false }),
  handleErrorAsync(googleAuthControllers.loginWithGoogle))

export default router;
