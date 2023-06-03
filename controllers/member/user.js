"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
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
const usersModel_1 = __importDefault(require("../../models/usersModel"));
const uuid_1 = require("uuid");
const appError_1 = __importDefault(require("../../service/appError"));
const handleSuccess_1 = __importDefault(require("../../service/handleSuccess"));
const auth_1 = require("../../middleware/auth");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const checkError_1 = require("../../service/checkError");
const firebase_1 = __importDefault(require("../../middleware/firebase"));
const jwt = __importStar(require("jsonwebtoken"));
const connectRedis_1 = __importDefault(require("../../connections/connectRedis"));
const email_1 = require("../../service/email");
const userOrderModel_1 = require("../../models/userOrderModel");
const crypto_1 = require("../../service/crypto");
const dayjs_1 = __importDefault(require("dayjs"));
// 引入上傳圖片會用到的套件
const bucket = firebase_1.default.storage().bucket();
const user = {
    // NOTE 登入
    login(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            const { email, password } = req.body;
            if (!email || !password) {
                return (0, appError_1.default)(400, '帳號或密碼錯誤', next);
            }
            const user = yield usersModel_1.default.findOne({
                email,
                isDisabled: false,
                role: "user"
            }).select('+password');
            if (!user) {
                return (0, appError_1.default)(401, '無此會員或已停用', next);
            }
            if (!user.password) {
                return (0, appError_1.default)(401, '此會員須為 google 登入', next);
            }
            const auth = yield bcryptjs_1.default.compare(password, user.password);
            if (!auth) {
                return (0, appError_1.default)(400, '密碼錯誤', next);
            }
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
                return (0, appError_1.default)(400, errorMsg, next);
            }
            // 檢查暱稱是否已使用
            // const userCheck = await User.findOne({
            //   username: username
            // })
            // if(userCheck !== null) {
            //   return appError(400, "此暱稱已被使用", next);
            // }
            try {
                // 加密密碼
                password = yield bcryptjs_1.default.hash(req.body.password, 12);
                yield usersModel_1.default.create({ email, password, username });
                (0, handleSuccess_1.default)(res, '註冊成功', 201);
            }
            catch (error) {
                // 不打資料庫，使用 mongoose 回傳的錯誤檢查  
                if (error && error.code === 11000) {
                    return (0, appError_1.default)(400, '此 Email 已使用', next);
                }
                else {
                    return (0, appError_1.default)(400, error, next);
                }
            }
        });
    },
    // NOTE 登出
    logout(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            yield connectRedis_1.default.del(req.user.id);
            (0, handleSuccess_1.default)(res, '已登出');
        });
    },
    // NOTE 取得個人資料
    profile(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { username, picture, email } = req.user;
            const data = { email, username, picture };
            (0, handleSuccess_1.default)(res, data);
        });
    },
    // NOTE 更新個人資料
    updateProfiles(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            const { username, picture } = req.body;
            const updateData = {};
            if (!username) {
                return (0, appError_1.default)("400", '暱稱不得為空值', next);
            }
            // 判斷是否有上傳圖片
            if (picture) {
                updateData.picture = picture;
            }
            updateData.username = username;
            yield usersModel_1.default.findByIdAndUpdate(req.user.id, { $set: updateData });
            (0, handleSuccess_1.default)(res, '修改成功');
        });
    },
    // NOTE 上傳個人圖片
    uploadUserImage(req, res, next) {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            if (!((_a = req.files) === null || _a === void 0 ? void 0 : _a.length)) {
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
    // NOTE 更新密碼
    updatePassword(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            let { password, newPassword, confirmPassword } = req.body;
            const userId = req.user.id;
            const user = yield usersModel_1.default.findOne({ _id: userId }).select('+password');
            if (user) {
                if (user.password) {
                    const checkPassword = yield bcryptjs_1.default.compare(password, user.password);
                    if (!checkPassword) {
                        return (0, appError_1.default)(400, '原密碼不正確', next);
                    }
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
                yield usersModel_1.default.findByIdAndUpdate(req.user.id, { password: newPassword });
                (0, handleSuccess_1.default)(res, '密碼已修改');
            }
        });
    },
    // NOTE 忘記密碼寄信
    forgotPassword(req, res, next) {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            const { email } = req.body;
            const user = yield usersModel_1.default.findOne({ email });
            if (!user) {
                return (0, appError_1.default)(400, "無此會員信箱", next);
            }
            // 建立會員 token
            const secretKey = (_a = process.env.JWT_SECRET) !== null && _a !== void 0 ? _a : '';
            const token = jwt.sign({ id: user._id }, secretKey, {
                expiresIn: process.env.MAIL_EXPIRES_TIME
            });
            const now = (0, dayjs_1.default)();
            const afterOneHour = now.add(1, 'hour');
            const time = afterOneHour.format('YYYY-MM-DD HH:mm:ss');
            const email_title = 'musitix 重設密碼連結';
            const email_content = `
      <p>親愛的 musitix 會員您好</p>
      <p>
        您收到這封郵件是因為我們收到了您重設密碼的請求，請於 ${time} 前完成修改密碼。
      </p>
      <p>若您確定要重設密碼，請點擊以下連結：</p>
      <a
        href="${process.env.EMAILURL}${token}"
      >${process.env.EMAILURL}${token}</a>
      <p>此連結將會帶您前往密碼重設頁面。如果您未發出此請求，請忽略此郵件，您的密碼不會有任何更改。</p>
      <p>謝謝！</p>
      <p>musitix 活動主辦方</p>
    `;
            // 建立 email 內容
            const options = (0, email_1.mailOptions)(email, email_title, email_content);
            // email 寄信
            email_1.transporter.sendMail(options, (error, info) => {
                if (error) {
                    return (0, appError_1.default)(500, error, next);
                }
                (0, handleSuccess_1.default)(res, '寄信成功');
            });
        });
    },
    // NOTE 忘記密碼/密碼修改
    resetPassword(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            let { newPassword, confirmPassword } = req.body;
            const userId = req.user.id;
            // 檢查會員是否存在
            const user = yield usersModel_1.default.findOne({ _id: userId });
            if (user) {
                if (!newPassword) {
                    return (0, appError_1.default)(400, '請輸入新密碼', next);
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
                // 修改密碼
                yield usersModel_1.default.findByIdAndUpdate(req.user.id, { password: newPassword });
                (0, handleSuccess_1.default)(res, '密碼已修改');
            }
            else {
                return (0, appError_1.default)(400, '查無此會員', next);
            }
        });
    },
    // 取得預填資料
    getPreFilledInfo(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            const userId = req.user.id;
            const data = yield usersModel_1.default
                .findById(userId)
                .select('preFilledInfo');
            (0, handleSuccess_1.default)(res, data.preFilledInfo);
        });
    },
    // 更新預填資料
    updatePreFilledInfo(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            const userId = req.user.id;
            const { email, buyer, cellPhone, address } = req.body;
            const preFilledInfo = { email, buyer, cellPhone, address };
            const data = yield usersModel_1.default
                .findByIdAndUpdate(userId, { preFilledInfo });
            (0, handleSuccess_1.default)(res, '修改成功');
        });
    },
    // 取得訂單資訊
    getOrderInfo(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            const { id } = req.params;
            const userOrderInfo = yield userOrderModel_1.UserOrderModel.findById(id).lean();
            const now = new Date();
            const TimeStamp = now.getTime();
            let aesEncrypt;
            let shaEncrypt;
            if (userOrderInfo) {
                // 藍新金流資訊
                const TradeInfo = {
                    TimeStamp,
                    MerchantOrderNo: userOrderInfo.orderNumber,
                    Amt: userOrderInfo.activityInfo.totalAmount,
                    ItemDesc: userOrderInfo.activityInfo.title,
                    Email: userOrderInfo.email
                };
                aesEncrypt = (0, crypto_1.createMpgAesEncrypt)(TradeInfo, id);
                shaEncrypt = (0, crypto_1.createMpgShaEncrypt)(aesEncrypt);
            }
            const json = {
                order: userOrderInfo,
                TimeStamp,
                MerchantID: process.env.MerchantID,
                Version: process.env.Version,
                aesEncrypt,
                shaEncrypt
            };
            (0, handleSuccess_1.default)(res, json);
        });
    },
    getOrderList(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            const userId = req.user.id;
            const userOrderList = yield userOrderModel_1.UserOrderModel.find({ userId }).lean();
            const results = userOrderList.map((userOrder) => ({
                orderId: userOrder._id.toString(),
                activityTitle: userOrder.activityInfo.title,
                orderCreateDate: userOrder.orderCreateDate,
                ticketCount: userOrder.ticketList.length,
                scheduleName: userOrder.ticketList.map((ticket) => ticket.scheduleName),
                categoryName: userOrder.ticketList.map((ticket) => ticket.categoryName),
                orderStatus: userOrder.orderStatus,
            }));
            (0, handleSuccess_1.default)(res, results);
        });
    },
    deleteOrder(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            const { id } = req.params;
            // 檢查訂單是否存在
            const existingUserOrder = yield userOrderModel_1.UserOrderModel.findById(id);
            if (!existingUserOrder) {
                return (0, appError_1.default)(400, '查無此訂單', next);
            }
            // 更新所有票券的狀態為 "Refunded"
            existingUserOrder.ticketList.forEach(ticket => {
                ticket.ticketStatus = userOrderModel_1.TicketStatus.Refunded;
            });
            // 檢查是否所有票券都已退票
            const allTicketsRefunded = existingUserOrder.ticketList.every(ticket => ticket.ticketStatus === userOrderModel_1.TicketStatus.Refunded);
            // 如果所有票券都已退票，則將訂單狀態更新為 "Refunded"
            if (allTicketsRefunded) {
                existingUserOrder.orderStatus = userOrderModel_1.OrderStatus.Refunded;
            }
            // 更新訂單和票券狀態
            yield userOrderModel_1.UserOrderModel.updateOne({ _id: id }, {
                $set: {
                    orderStatus: existingUserOrder.orderStatus,
                    ticketList: existingUserOrder.ticketList
                }
            });
            (0, handleSuccess_1.default)(res, "退票成功");
        });
    },
    // 取得訂單QRcode狀態(只取狀態)
    getOrderQRcodeStatus(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            const { id } = req.params; // order id
            const userOrderInfo = yield userOrderModel_1.UserOrderModel
                .findById(id)
                .select({
                'ticketList.ticketStatus': 1,
                'ticketList._id': 1
            });
            if (!userOrderInfo) {
                return (0, appError_1.default)(400, '查無訂單', next);
            }
            (0, handleSuccess_1.default)(res, userOrderInfo);
        });
    },
    // 使用者是否已設定密碼
    getPasswordExisted(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            const userId = req.user.id;
            const user = yield usersModel_1.default
                .findById(userId)
                .select('password');
            (0, handleSuccess_1.default)(res, !!(user === null || user === void 0 ? void 0 : user.password));
        });
    },
};
exports.default = user;
