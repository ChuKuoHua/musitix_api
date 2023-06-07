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
Object.defineProperty(exports, "__esModule", { value: true });
exports.OrderStatus = exports.TicketStatus = exports.UserOrderModel = void 0;
const mongoose_1 = __importStar(require("mongoose"));
var OrderStatus;
(function (OrderStatus) {
    OrderStatus[OrderStatus["Failed"] = 0] = "Failed";
    OrderStatus[OrderStatus["ReadyToUse"] = 1] = "ReadyToUse";
    OrderStatus[OrderStatus["PendingPayment"] = 2] = "PendingPayment";
    OrderStatus[OrderStatus["Used"] = 3] = "Used";
    OrderStatus[OrderStatus["Expired"] = 4] = "Expired";
    OrderStatus[OrderStatus["Refunded"] = 5] = "Refunded";
    OrderStatus[OrderStatus["InReview"] = 6] = "InReview"; // 審核中
})(OrderStatus || (OrderStatus = {}));
exports.OrderStatus = OrderStatus;
var TicketStatus;
(function (TicketStatus) {
    TicketStatus[TicketStatus["Failed"] = 0] = "Failed";
    TicketStatus[TicketStatus["ReadyToUse"] = 1] = "ReadyToUse";
    TicketStatus[TicketStatus["PendingPayment"] = 2] = "PendingPayment";
    TicketStatus[TicketStatus["Used"] = 3] = "Used";
    TicketStatus[TicketStatus["Expired"] = 4] = "Expired";
    TicketStatus[TicketStatus["Refunded"] = 5] = "Refunded";
    TicketStatus[TicketStatus["InReview"] = 6] = "InReview"; // 審核中
})(TicketStatus || (TicketStatus = {}));
exports.TicketStatus = TicketStatus;
const ticketSchema = new mongoose_1.Schema({
    scheduleName: { type: String, required: true },
    categoryName: { type: String, required: true },
    price: { type: Number, required: true },
    ticketNumber: { type: String, required: true },
    ticketStatus: {
        type: Number,
        default: TicketStatus.PendingPayment,
        enum: TicketStatus, required: true
    },
    qrCode: { type: String, required: true }
});
const UserOrderSchema = new mongoose_1.Schema({
    buyer: { type: String, required: true },
    cellPhone: { type: String, required: true },
    email: { type: String, required: true },
    address: { type: String, required: true },
    orderNumber: { type: String, required: true },
    orderStatus: { type: Number,
        default: OrderStatus.PendingPayment,
        enum: OrderStatus, required: true },
    orderCreateDate: { type: Date, default: Date.now },
    memo: { type: String },
    ticketList: { type: [ticketSchema], required: true },
    activityInfo: {
        title: { type: String },
        sponsorName: { type: String },
        location: { type: String },
        address: { type: String },
        startDate: { type: Date },
        endDate: { type: Date },
        mainImageUrl: { type: String },
        totalAmount: { type: Number },
        ticketTotalCount: { type: Number },
        ticketCategories: [{
                categoryName: { type: String },
                price: { type: Number }
            }]
    },
    activityId: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: 'activities'
    },
    userId: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: 'user'
    },
    payTime: { type: Date },
    tradeNo: { type: String },
    paymentType: { type: String },
    escrowBank: { type: String },
    Card6No: { type: String },
    Card4No: { type: String }
});
const UserOrderModel = mongoose_1.default.model('userorder', UserOrderSchema);
exports.UserOrderModel = UserOrderModel;
