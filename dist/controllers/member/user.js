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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const users_1 = __importDefault(require("../../models/users"));
const uuid_1 = require("uuid");
const appError_1 = __importDefault(require("../../service/appError"));
const handleSuccess_1 = __importDefault(require("../../service/handleSuccess"));
const auth_1 = require("../../middleware/auth");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const checkError_1 = require("../../service/checkError");
// 引入上傳圖片會用到的套件
const firebaseAdmin = require('../../middleware/firebase');
const bucket = firebaseAdmin.storage().bucket();
const user = {
    // NOTE 登入
    login(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            const { email, password } = req.body;
            if (!email || !password) {
                return next((0, appError_1.default)(400, '帳號或密碼錯誤', next));
            }
            const user = yield users_1.default.findOne({
                email,
                isDisabled: false,
                role: "user"
            }).select('+password');
            if (!user) {
                return next((0, appError_1.default)(401, '無此會員或已停用', next));
            }
            const auth = yield bcryptjs_1.default.compare(password, user.password);
            if (!auth) {
                return next((0, appError_1.default)(400, '密碼錯誤', next));
            }
            req.session.role = user.role;
            req.session.isLogin = true;
            (0, auth_1.generateSendJWT)(user, 200, res);
        });
    },
    // NOTE 註冊
    register(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            let { email, username, password } = req.body;
            // 檢查欄位
            const errorMsg = (0, checkError_1.checkRegister)(req);
            if (errorMsg.length > 0) {
                return next((0, appError_1.default)(400, errorMsg, next));
            }
            // 檢查暱稱是否已使用
            const userCheck = yield users_1.default.findOne({
                username: username
            });
            if (userCheck !== null) {
                return next((0, appError_1.default)(400, "此暱稱已被使用", next));
            }
            try {
                // 加密密碼
                password = yield bcryptjs_1.default.hash(req.body.password, 12);
                yield users_1.default.create({
                    email,
                    password,
                    username
                });
                (0, handleSuccess_1.default)(res, '註冊成功', 201);
            }
            catch (error) {
                // 不打資料庫，使用 mongoose 回傳的錯誤檢查  
                if (error && error.code === 11000) {
                    return next((0, appError_1.default)(400, '此 Email 已使用', next));
                }
                else {
                    return next((0, appError_1.default)(400, error, next));
                }
            }
        });
    },
    // NOTE 登出
    logout(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            req.session.destroy(() => { });
            (0, handleSuccess_1.default)(res, '已登出');
        });
    },
    // NOTE 取得個人資料
    profile(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { username, picture, email } = req.user;
            const data = {
                email,
                username,
                picture
            };
            (0, handleSuccess_1.default)(res, data);
        });
    },
    // NOTE 更新個人資料
    updateProfiles(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            const { username, picture } = req.body;
            const updateData = {};
            if (!username) {
                // errorMsg.push("暱稱不得為空值");
                return next((0, appError_1.default)("400", '暱稱不得為空值', next));
            }
            // if(password) {
            //   const email = req.user.email
            //   const user = await User.findOne(
            //     {
            //       email
            //     },
            //   ).select('+password');
            //   if(user) {
            //     const auth = await bcrypt.compare(password, user.password);
            //     if(!auth){
            //       return next(appError(400,'原密碼不正確',next));
            //     }
            //     if(!newPassword) {
            //       return next(appError(400,'請輸入新密碼',next));
            //     }
            //     if(password === newPassword) {
            //       return next(appError(400,'新密碼不可於原密碼相同',next));
            //     }
            //     // 密碼檢查
            //     if(checkPwdFormat(newPassword)) {
            //       errorMsg.push(checkPwdFormat(newPassword));
            //     }
            //     if(newPassword !== confirmPassword){
            //       errorMsg.push("密碼不一致");
            //     }
            //     newPassword = await bcrypt.hash(password,12);
            //   }
            // }
            // if(errorMsg.length > 0) {
            //   return next(appError("400", errorMsg, next));
            // }
            // 判斷是否有上傳圖片
            if (picture) {
                updateData.picture = picture;
            }
            // 判斷是否有修改密碼
            // if(newPassword) {
            //   updateData.password = newPassword
            // }
            updateData.username = username;
            yield users_1.default.findByIdAndUpdate(req.user.id, {
                $set: updateData
            });
            (0, handleSuccess_1.default)(res, '修改成功');
        });
    },
    // NOTE 上傳個人圖片
    uploadUserImage(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!req.files || !req.files.length) {
                return next((0, appError_1.default)(400, "尚未上傳檔案", next));
            }
            // 取得上傳的檔案資訊列表裡面的第一個檔案
            const file = req.files[0];
            // 基於檔案的原始名稱建立一個 blob 物件
            const blob = bucket.file(`images/user/${(0, uuid_1.v4)()}.${file.originalname.split('.').pop()}`);
            // 建立一個可以寫入 blob 的物件
            const blobStream = blob.createWriteStream();
            // 監聽上傳狀態，當上傳完成時，會觸發 finish 事件
            blobStream.on('finish', () => {
                // 設定檔案的存取權限
                const config = {
                    action: 'read',
                    expires: '12-31-2500', // 網址的有效期限
                };
                // 取得檔案的網址
                blob.getSignedUrl(config, (err, fileUrl) => {
                    (0, handleSuccess_1.default)(res, fileUrl);
                });
            });
            // 如果上傳過程中發生錯誤，會觸發 error 事件
            blobStream.on('error', (err) => {
                return next((0, appError_1.default)("500", '上傳失敗', next));
            });
            // 將檔案的 buffer 寫入 blobStream
            blobStream.end(file.buffer);
        });
    },
    // 更新密碼
    updatePassword(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            let { password, newPassword, confirmPassword } = req.body;
            const email = req.user.email;
            const user = yield users_1.default.findOne({
                email
            }).select('+password');
            if (user) {
                const auth = yield bcryptjs_1.default.compare(password, user.password);
                if (!auth) {
                    return next((0, appError_1.default)(400, '原密碼不正確', next));
                }
                if (!newPassword) {
                    return next((0, appError_1.default)(400, '請輸入新密碼', next));
                }
                if (password === newPassword) {
                    return next((0, appError_1.default)(400, '新密碼不可與原密碼相同', next));
                }
                const errorMsg = [];
                // 密碼檢查
                const pwdError = (0, checkError_1.checkPwd)(newPassword, confirmPassword);
                if (pwdError) {
                    errorMsg.push(pwdError);
                }
                if (errorMsg.length > 0) {
                    return next((0, appError_1.default)(400, errorMsg, next));
                }
                newPassword = yield bcryptjs_1.default.hash(newPassword, 12);
                yield users_1.default.findByIdAndUpdate(req.user.id, {
                    password: newPassword
                });
                (0, handleSuccess_1.default)(res, '密碼已修改');
            }
        });
    },
};
exports.default = user;
