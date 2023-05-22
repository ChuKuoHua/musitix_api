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
const appError_1 = __importDefault(require("../../service/appError"));
const handleSuccess_1 = __importDefault(require("../../service/handleSuccess"));
const checkError_1 = require("../../service/checkError");
const admin_1 = require("../../middleware/admin");
const host_1 = __importDefault(require("../../models/host"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const validator_1 = __importDefault(require("validator"));
const firebase_1 = __importDefault(require("../../middleware/firebase"));
const uuid_1 = require("uuid");
const connectRedis_1 = __importDefault(require("../../connections/connectRedis"));
// 引入上傳圖片會用到的套件
const bucket = firebase_1.default.storage().bucket();
const admin = {
    // NOTE 登入
    login(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            const { account, password } = req.body;
            if (!account || !password) {
                return (0, appError_1.default)(400, '帳號或密碼錯誤', next);
            }
            const host = yield host_1.default.findOne({
                account,
                isDisabled: false, // false 啟用 true 停用
            }).select('+password');
            if (!host) {
                return (0, appError_1.default)(401, '無此主辦帳號', next);
            }
            const auth = yield bcryptjs_1.default.compare(password, host.password);
            if (!auth) {
                return (0, appError_1.default)(400, '您的密碼不正確', next);
            }
            (0, admin_1.generateSendAdminJWT)(host, 200, res);
        });
    },
    // NOTE 註冊
    register(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            let { email, account, username, password, confirmPassword } = req.body;
            const errorMsg = [];
            // 檢查信箱是否已使用
            const adminCheck = yield host_1.default.findOne({
                "email": email
            });
            if (adminCheck) {
                return (0, appError_1.default)(400, "此 Email 已使用", next);
            }
            // 內容不可為空
            if (!email || !account || !username || !password || !confirmPassword) {
                return (0, appError_1.default)(400, "欄位未填寫正確！", next);
            }
            // 是否為 Email
            if (!validator_1.default.isEmail(email)) {
                errorMsg.push("Email 格式不正確");
            }
            // 密碼檢查
            const pwdError = (0, checkError_1.checkPwd)(password, confirmPassword);
            if (pwdError) {
                errorMsg.push(pwdError);
            }
            // 確認密碼
            if (password !== confirmPassword) {
                errorMsg.push("密碼不一致");
            }
            if (errorMsg.length > 0) {
                return (0, appError_1.default)(400, errorMsg, next);
            }
            // 加密密碼
            password = yield bcryptjs_1.default.hash(req.body.password, 12);
            const newAdmin = yield host_1.default.create({
                email,
                account,
                password,
                username,
                role: 'host'
            });
            (0, admin_1.generateSendAdminJWT)(newAdmin, 201, res);
        });
    },
    // NOTE 登出
    logout(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            // await Host.findByIdAndUpdate(req.admin.id,
            //   {
            //     token: ''
            //   }
            // );
            yield connectRedis_1.default.del(req.admin.id);
            (0, handleSuccess_1.default)(res, '已登出');
        });
    },
    // NOTE 取得主辦資料
    profile(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { username, picture, email } = req.admin;
            const data = {
                email,
                username,
                picture
            };
            (0, handleSuccess_1.default)(res, data);
        });
    },
    // NOTE 更新主辦資料
    updateProfiles(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            const { username, picture } = req.body;
            const updateData = {};
            if (!username) {
                // errorMsg.push("暱稱不得為空值");
                return (0, appError_1.default)("400", '暱稱不得為空值', next);
            }
            // 判斷是否有上傳圖片
            if (picture) {
                updateData.picture = picture;
            }
            updateData.username = username;
            yield host_1.default.findByIdAndUpdate(req.admin.id, {
                $set: updateData
            });
            (0, handleSuccess_1.default)(res, '修改成功');
        });
    },
    // NOTE 上傳主辦圖片
    uploadUserImage(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!req.files || !req.files.length) {
                return (0, appError_1.default)(400, "尚未上傳檔案", next);
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
                const callback = (err, fileUrl) => {
                    return (0, handleSuccess_1.default)(res, fileUrl);
                };
                // 取得檔案的網址
                blob.getSignedUrl(config, callback);
            });
            // 如果上傳過程中發生錯誤，會觸發 error 事件
            blobStream.on('error', (err) => {
                return (0, appError_1.default)("500", '上傳失敗', next);
            });
            // 將檔案的 buffer 寫入 blobStream
            blobStream.end(file.buffer);
        });
    },
    // 更新密碼
    updatePassword(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            let { password, newPassword, confirmPassword } = req.body;
            const hostId = req.admin.id;
            const host = yield host_1.default.findOne({
                hostId
            }).select('+password');
            if (host) {
                const auth = yield bcryptjs_1.default.compare(password, host.password);
                if (!auth) {
                    return (0, appError_1.default)(400, '原密碼不正確', next);
                }
                if (!newPassword) {
                    return (0, appError_1.default)(400, '請輸入新密碼', next);
                }
                if (password === newPassword) {
                    return (0, appError_1.default)(400, '新密碼不可與原密碼相同', next);
                }
                const errorMsg = [];
                // 密碼檢查
                const pwdError = (0, checkError_1.checkPwd)(newPassword, confirmPassword);
                if (pwdError) {
                    errorMsg.push(pwdError);
                }
                if (errorMsg.length > 0) {
                    return (0, appError_1.default)(400, errorMsg, next);
                }
                newPassword = yield bcryptjs_1.default.hash(newPassword, 12);
                yield host_1.default.findByIdAndUpdate(req.admin.id, {
                    password: newPassword
                });
                (0, handleSuccess_1.default)(res, '密碼已修改');
            }
        });
    },
    // 主辦刪除
    deleteHost(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            yield host_1.default.deleteOne({ id: req.params.id });
            (0, handleSuccess_1.default)(res, '已刪除');
        });
    }
};
exports.default = admin;
