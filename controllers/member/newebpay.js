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
const crypto_1 = require("../../service/crypto");
const userOrderModel_1 = require("../../models/userOrderModel");
const dayjs_1 = __importDefault(require("dayjs"));
const newebpay = {
    // NOTE 交易成功導回頁面
    // async newebpayReturn(req: Request, res: Response, next: NextFunction) {
    //   const response = req.body;
    //   const data = createMpgAesDecrypt(response.TradeInfo);
    //   if(response.Status === 'SUCCESS') {
    //     res.redirect('https://musitix-south3.onrender.com/#/');
    //   } else {
    //     res.redirect('https://musitix-south3.onrender.com/#/');
    //   }
    // },
    // 回傳狀態後，修改訂單狀態
    newebpayNotify(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            const response = req.body;
            const thisShaEncrypt = (0, crypto_1.createMpgShaEncrypt)(response.TradeInfo);
            // 使用 HASH 再次 SHA 加密字串，確保比對一致（確保不正確的請求觸發交易成功）
            if (!thisShaEncrypt === response.TradeSha) {
                return (0, appError_1.default)(500, '付款失敗：TradeSha 不一致', next);
            }
            // NOTE 確認交易：Notify
            const data = (0, crypto_1.createMpgAesDecrypt)(response.TradeInfo);
            // 取得交易內容，並查詢本地端資料庫是否有相符的訂單
            const { MerchantOrderNo, PayTime, TradeNo, PaymentType, EscrowBank } = data.Result;
            const inputFormat = 'YYYY-MM-DDTHH:mm:ss';
            const outputFormat = 'YYYY-MM-DDTHH:mm:ss.SSSZ';
            // 將日期字串轉換為指定格式的日期物件
            const dateObj = (0, dayjs_1.default)(PayTime, inputFormat);
            // 將日期物件轉換為指定格式的字串
            const newPayTime = dateObj.format(outputFormat);
            const orderData = yield userOrderModel_1.UserOrderModel.findOne({ orderNumber: MerchantOrderNo });
            if (!orderData) {
                return (0, appError_1.default)(500, '查無此訂單', next);
            }
            if (response.Status === 'SUCCESS') {
                yield userOrderModel_1.UserOrderModel.updateOne({
                    orderNumber: MerchantOrderNo
                }, {
                    $set: {
                        orderStatus: userOrderModel_1.TicketStatus.ReadyToUse,
                        'ticketList.$[].ticketStatus': userOrderModel_1.TicketStatus.ReadyToUse,
                        payTime: newPayTime,
                        tradeNo: TradeNo,
                        paymentType: PaymentType,
                        escrowBank: EscrowBank // 付款銀行
                    },
                });
                (0, handleSuccess_1.default)(res, `付款完成，訂單：${MerchantOrderNo}`);
            }
            else {
                yield userOrderModel_1.UserOrderModel.updateOne({
                    orderNumber: MerchantOrderNo
                }, {
                    $set: {
                        orderStatus: userOrderModel_1.TicketStatus.Failed,
                        'ticketList.$[].ticketStatus': userOrderModel_1.TicketStatus.Failed,
                        payTime: newPayTime
                    },
                });
                (0, handleSuccess_1.default)(res, `付款失敗，訂單：${MerchantOrderNo}`);
            }
        });
    },
};
exports.default = newebpay;
