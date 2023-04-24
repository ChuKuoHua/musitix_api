"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const handleSuccess = require('../../service/handleSuccess');
const { generateSendJWT } = require('../../middleware/auth');
const appError = require('../../service/appError');
const User = require('../../models/users');
const bcrypt = require('bcryptjs');
const validator = require('validator');
const checkPwd = require('../../service/pwdCheckError');
const user = {
    // NOTE 登入
    login(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            const { email, password } = req.body;
            if (!email || !password) {
                return next(appError(400, '帳號或密碼錯誤', next));
            }
            const user = yield User.findOne({
                email,
                isDisabled: false,
                role: "user"
            }).select('+password');
            if (!user) {
                return next(appError(401, '無此帳號或已停用', next));
            }
            const auth = yield bcrypt.compare(password, user.password);
            if (!auth) {
                return next(appError(400, '您的密碼不正確', next));
            }
            req.session.role = user.role;
            req.session.isLogin = true;
            generateSendJWT(user, 200, res);
        });
    },
    // NOTE 註冊
    register(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            let { email, username, password, confirmPassword } = req.body;
            const errorMsg = [];
            // 內容不可為空
            if (!email || !username || !password || !confirmPassword) {
                return next(appError(400, "欄位未填寫正確！", next));
            }
            // 是否為 Email
            if (!validator.isEmail(email)) {
                errorMsg.push("Email 格式不正確");
            }
            // 密碼檢查
            const pwdError = checkPwd(password);
            if (pwdError) {
                errorMsg.push(pwdError);
            }
            // 確認密碼
            if (password !== confirmPassword) {
                errorMsg.push("密碼不一致");
            }
            if (errorMsg.length > 0) {
                return next(appError(400, errorMsg, next));
            }
            // 檢查暱稱是否已使用
            const userCheck = yield User.findOne({
                username: username
            });
            if (userCheck !== null) {
                return next(appError(400, "此名稱已被使用", next));
            }
            try {
                // 加密密碼
                password = yield bcrypt.hash(req.body.password, 12);
                const newUser = yield User.create({
                    email,
                    password,
                    username
                });
                generateSendJWT(newUser, 201, res);
            }
            catch (error) {
                // 不打資料庫，使用 mongoose 回傳的錯誤檢查  
                if (error && error.code === 11000) {
                    return next(appError(400, "此 Email 已使用", next));
                }
                else {
                    return next(appError(400, error, next));
                }
            }
        });
    },
    // NOTE 登出
    logout(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            req.session.destroy(() => { });
            handleSuccess(res, '已登出');
        });
    },
    // NOTE 取得個人資料
    profile(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { username, picture, email } = req.user;
            const data = {
                id: req.user.id,
                email,
                username,
                picture
            };
            handleSuccess(res, data);
        });
    },
    // NOTE 更新個人資料
    updateProfiles(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            const { username, picture, password, confirmPassword } = req.body;
            let { newPassword } = req.body;
            const updateData = {};
            const errorMsg = [];
            if (!username) {
                errorMsg.push("暱稱不得為空值");
            }
            if (password) {
                const email = req.user.email;
                const user = yield User.findOne({
                    email
                }).select('+password');
                const auth = yield bcrypt.compare(password, user.password);
                if (!auth) {
                    return next(appError(400, '原密碼不正確', next));
                }
                if (!newPassword) {
                    return next(appError(400, '請輸入新密碼', next));
                }
                if (password === newPassword) {
                    return next(appError(400, '新密碼不可於原密碼相同', next));
                }
                // 密碼檢查
                if (checkPwd(newPassword)) {
                    errorMsg.push(checkPwd(newPassword));
                }
                if (newPassword !== confirmPassword) {
                    errorMsg.push("密碼不一致");
                }
                newPassword = yield bcrypt.hash(password, 12);
            }
            if (errorMsg.length > 0) {
                return next(appError("400", errorMsg, next));
            }
            // 判斷是否有上傳圖片
            if (picture) {
                updateData.picture = picture;
            }
            // 判斷是否有修改密碼
            if (newPassword) {
                updateData.password = newPassword;
            }
            updateData.username = username;
            yield User.findByIdAndUpdate(req.user.id, {
                $set: updateData
            });
            handleSuccess(res, '修改成功');
        });
    },
    // NOTE 上傳個人圖片
    updatePicture(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            const { picture } = req.body;
            // const allowedFormats = ['image/jpeg', 'image/png'];
            if (!picture) {
                return next(appError("400", '尚未上傳圖片', next));
            }
            // if(!allowedFormats.includes(picture)) {
            //   return next(appError("400", '圖片格式錯誤', next));
            // }
            yield User.findByIdAndUpdate(req.user.id, {
                $set: {
                    picture: picture
                }
            });
            handleSuccess(res, '成功');
        });
    },
    // 更新密碼
    // async updatePassword (req, res, next) {
    //   const { password,confirmPassword } = req.body;
    //   // 密碼 8 碼以上
    //   let errorMsg = checkPwd(password);
    //   if(errorMsg) {
    //     return next(appError("400", errorMsg, next));
    //   }
    //   if(password !== confirmPassword){
    //     return next(appError("400","密碼不一致！",next));
    //   }
    //   newPassword = await bcrypt.hash(password,12);
    //   const user = await User.findByIdAndUpdate(req.user.id,
    //     {
    //       password: newPassword
    //     }
    //   );
    //   generateSendJWT(user,200,res)
    // },
};
module.exports = user;
