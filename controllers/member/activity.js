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
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const activityModel_1 = __importStar(require("../../models/activityModel"));
const handleSuccess_1 = __importDefault(require("../../service/handleSuccess"));
const appError_1 = __importDefault(require("../../service/appError"));
const userOrderModel_1 = require("../../models/userOrderModel");
const orderService_1 = require("../../service/orderService");
const crypto_1 = require("../../service/crypto");
const activity = {
    getPublishedActivities(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            const activities = yield activityModel_1.default.find({ status: activityModel_1.ActivityStatus.Published }).lean();
            const oneMonthBefore = new Date();
            oneMonthBefore.setMonth(oneMonthBefore.getMonth() - 1);
            const currentDate = new Date();
            const oneMonthFromNow = new Date();
            oneMonthFromNow.setMonth(oneMonthFromNow.getMonth() + 1);
            const hotActivities = activities.map(activity => ({
                id: activity._id.toString(),
                title: activity.title,
                sponsorName: activity.sponsorName,
                startDate: activity.startDate,
                endDate: activity.endDate,
                minPrice: activity.minPrice,
                maxPrice: activity.maxPrice,
                mainImageUrl: activity.mainImageUrl,
                ticketCount: activity.schedules.reduce((total, schedule) => {
                    return total + schedule.ticketCategories.reduce((sum, category) => sum + category.totalQuantity, 0);
                }, 0)
            }));
            const upcomingActivities = activities.filter(activity => {
                const saleStartDate = new Date(activity.saleStartDate);
                return currentDate <= saleStartDate && saleStartDate <= oneMonthFromNow;
            }).map(activity => ({
                id: activity._id.toString(),
                title: activity.title,
                sponsorName: activity.sponsorName,
                startDate: activity.startDate,
                endDate: activity.endDate,
                minPrice: activity.minPrice,
                maxPrice: activity.maxPrice,
                mainImageUrl: activity.mainImageUrl,
                saleStartDate: activity.saleStartDate
            }));
            const recentActivities = activities.filter(activity => {
                const startDate = new Date(activity.startDate);
                return startDate >= currentDate && startDate <= oneMonthFromNow;
            }).map(activity => ({
                id: activity._id.toString(),
                title: activity.title,
                sponsorName: activity.sponsorName,
                startDate: activity.startDate,
                endDate: activity.endDate,
                minPrice: activity.minPrice,
                maxPrice: activity.maxPrice,
                mainImageUrl: activity.mainImageUrl
            }));
            const response = {
                hotActivities,
                upcomingActivities,
                recentActivities
            };
            (0, handleSuccess_1.default)(res, response);
        });
    },
    searchActivities(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            const { subject, minPrice, maxPrice, startDate, endDate } = req.query;
            const query = {
                status: { $in: [activityModel_1.ActivityStatus.Published] },
                startDate: { $gte: new Date() },
            };
            if (subject) {
                query.title = { $regex: subject, $options: 'i' };
            }
            if (minPrice) {
                query.minPrice = { $gte: Number(minPrice) };
            }
            if (maxPrice) {
                query.maxPrice = { $lte: Number(maxPrice) };
            }
            if (startDate) {
                query.startDate = { $gte: new Date(startDate.toString()) };
            }
            if (endDate) {
                query.endDate = { $lte: new Date(endDate.toString()) };
            }
            const activities = yield activityModel_1.default.find(query).lean();
            const newActivities = activities.map(activity => (Object.assign(Object.assign({}, activity), { id: activity._id })));
            (0, handleSuccess_1.default)(res, newActivities);
        });
    },
    getActivityById(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            const { id } = req.params;
            const activity = yield activityModel_1.default.findById(id).lean();
            const _a = activity, { _id } = _a, activityData = __rest(_a, ["_id"]);
            const response = Object.assign({ id: _id.toString() }, activityData);
            (0, handleSuccess_1.default)(res, response);
        });
    },
    getScheduleInfoById(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            const { scheduleId } = req.params;
            const activity = yield activityModel_1.default.findOne({ schedules: { $elemMatch: { _id: scheduleId } } });
            if (!activity) {
                return (0, appError_1.default)(400, '查無此場次id', next);
            }
            const schedule = activity === null || activity === void 0 ? void 0 : activity.schedules.find((schedule) => schedule._id.toString() === scheduleId);
            const result = {
                activityId: activity._id,
                title: activity.title,
                sponsorName: activity.sponsorName,
                location: activity.location,
                address: activity.address,
                schedule: schedule,
            };
            (0, handleSuccess_1.default)(res, result);
        });
    },
    bookingActivity(req, res, next) {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            const { id } = req.params;
            const { ticketList, buyer, cellPhone, email, address, memo } = req.body;
            if (!ticketList.length) {
                return next((0, appError_1.default)(400, 'ticketList is invalid', next));
            }
            const activity = yield activityModel_1.default.findById(id);
            if (!activity) {
                return next((0, appError_1.default)(400, '活動不存在', next));
            }
            const userId = req.user.id;
            const orderNumber = (0, orderService_1.generateOrderNumber)();
            let totalAmount = 0;
            let ticketTotalCount = 0;
            const ticketCategories = activity.schedules.flatMap(schedule => schedule.ticketCategories);
            // 檢查是否有錯誤
            for (const ticket of ticketList) {
                const { id: ticketId } = ticket;
                // 根據 ticketList 中的 ID 查找對應的 ticketCategory
                const ticketCategory = ticketCategories.find(category => category._id.toString() === ticketId);
                if (!ticketCategory) {
                    return next((0, appError_1.default)(400, '票名不存在', next));
                }
                if (ticket.headCount > ticketCategory.remainingQuantity) {
                    return next((0, appError_1.default)(400, '票已售完', next));
                }
            }
            // 確定沒問題再建立model
            const newUserOrder = new userOrderModel_1.UserOrderModel({
                buyer,
                cellPhone,
                email,
                address,
                memo,
                orderNumber,
                orderStatus: userOrderModel_1.OrderStatus.PendingPayment,
                orderCreateDate: new Date(),
                ticketList: [],
                activityInfo: {
                    title: activity.title,
                    sponsorName: activity.sponsorName,
                    location: activity.location,
                    address: activity.address,
                    startDate: activity.startDate,
                    endDate: activity.endDate,
                    mainImageUrl: activity.mainImageUrl,
                    totalAmount: 0,
                    ticketTotalCount: 0
                },
                activityId: activity._id,
                userId: userId
            });
            for (const ticket of ticketList) {
                const { id: ticketId, headCount } = ticket;
                // 根據 ticketList 中的 ID 查找對應的 ticketCategory
                const ticketCategory = ticketCategories.find(category => category._id.toString() === ticketId);
                // 創建新的 ticketList
                for (let i = 0; i < headCount; i++) {
                    const orderNumber = newUserOrder.orderNumber;
                    const randomCode = (0, orderService_1.generateRandomString)(6);
                    const ticketNumber = `${orderNumber}_${randomCode}_${newUserOrder.ticketList.length + 1}`;
                    const newUserTicket = {
                        _id: new mongoose_1.Types.ObjectId(),
                        scheduleName: ((_a = activity.schedules.find(schedule => schedule.scheduleName)) === null || _a === void 0 ? void 0 : _a.scheduleName) || '',
                        categoryName: ticketCategory.categoryName,
                        price: ticketCategory.price,
                        ticketNumber,
                        ticketStatus: userOrderModel_1.TicketStatus.PendingPayment,
                        qrCode: yield (0, orderService_1.generateQRCode)('N/A'),
                        // TODO 
                        // qrCode移到前端實作，故等前端也改好後，此處要拿掉
                    };
                    newUserOrder.ticketList.push(newUserTicket);
                    totalAmount += ticketCategory.price;
                    ticketTotalCount += 1;
                }
                // 減少票的剩餘數量
                ticketCategory.remainingQuantity -= headCount;
            }
            const orderId = newUserOrder._id;
            newUserOrder.activityInfo.totalAmount = totalAmount; // 新增總金額
            newUserOrder.activityInfo.ticketTotalCount = ticketTotalCount; // 新增總票數
            // 保存 UserOrder 和更新活動
            yield newUserOrder.save();
            yield activity.save();
            const result = {
                orderId: orderId.toString(),
            };
            (0, handleSuccess_1.default)(res, result);
        });
    },
    getNewebPayInfo(req, res, next) {
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
            const ticketListWithId = userOrderInfo === null || userOrderInfo === void 0 ? void 0 : userOrderInfo.ticketList.map((_a) => {
                var { _id } = _a, ticket = __rest(_a, ["_id"]);
                return (Object.assign({ id: _id }, ticket));
            });
            const json = {
                order: {
                    orderNumber: userOrderInfo === null || userOrderInfo === void 0 ? void 0 : userOrderInfo.orderNumber,
                    buyer: userOrderInfo === null || userOrderInfo === void 0 ? void 0 : userOrderInfo.buyer,
                    cellPhone: userOrderInfo === null || userOrderInfo === void 0 ? void 0 : userOrderInfo.cellPhone,
                    email: userOrderInfo === null || userOrderInfo === void 0 ? void 0 : userOrderInfo.email,
                    address: userOrderInfo === null || userOrderInfo === void 0 ? void 0 : userOrderInfo.address,
                    memo: userOrderInfo === null || userOrderInfo === void 0 ? void 0 : userOrderInfo.memo,
                    activityInfo: {
                        title: userOrderInfo === null || userOrderInfo === void 0 ? void 0 : userOrderInfo.activityInfo.title,
                        sponsorName: userOrderInfo === null || userOrderInfo === void 0 ? void 0 : userOrderInfo.activityInfo.sponsorName,
                        location: userOrderInfo === null || userOrderInfo === void 0 ? void 0 : userOrderInfo.activityInfo.location,
                        address: userOrderInfo === null || userOrderInfo === void 0 ? void 0 : userOrderInfo.activityInfo.address,
                    },
                    ticketList: ticketListWithId
                },
                TimeStamp,
                MerchantID: process.env.MerchantID,
                Version: process.env.Version,
                aesEncrypt,
                shaEncrypt
            };
            (0, handleSuccess_1.default)(res, json);
        });
    }
};
exports.default = activity;
