"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ActivityStatus = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const lodash_1 = require("lodash");
// 活動狀態
var ActivityStatus;
(function (ActivityStatus) {
    ActivityStatus[ActivityStatus["Unknown"] = 0] = "Unknown";
    ActivityStatus[ActivityStatus["Unpublished"] = 1] = "Unpublished";
    ActivityStatus[ActivityStatus["Published"] = 2] = "Published";
    ActivityStatus[ActivityStatus["Ended"] = 3] = "Ended";
    ActivityStatus[ActivityStatus["Canceled"] = 4] = "Canceled";
    ActivityStatus[ActivityStatus["Discontinued"] = 5] = "Discontinued"; // 已停辦
})(ActivityStatus = exports.ActivityStatus || (exports.ActivityStatus = {}));
const nameMaxLength = 100;
const ticketCategorySchema = new mongoose_1.default.Schema({
    categoryName: {
        type: String,
        required: [true, '票種名稱必填'],
        maxlength: [nameMaxLength, `票種名稱超過最大長度限制: ${nameMaxLength}`],
        trim: true
    },
    price: {
        type: Number,
        required: [true, '票價必填'],
        min: [0, `票價最小值: 0`],
        trim: true
    },
    totalQuantity: {
        type: Number,
        required: [true, '票券總數量必填'],
        min: [1, `票券總數量最小值: 1`],
        trim: true
    },
    remainingQuantity: {
        type: Number,
        required: [true, '票券剩餘數量必填'],
        min: [0, `票券剩餘數量最小值: 0`],
        trim: true
    },
});
const activityScheduleSchema = new mongoose_1.default.Schema({
    scheduleName: {
        type: String,
        required: [true, '場次名稱必填'],
        maxlength: [nameMaxLength, `場次名稱超過最大長度限制: ${nameMaxLength}`],
        trim: true
    },
    ticketCategories: {
        type: [ticketCategorySchema],
        validate: [
            function () {
                var _a;
                return !!(((_a = this.ticketCategories) === null || _a === void 0 ? void 0 : _a.length) > 0);
            },
            '票種必填(至少一項)'
        ]
    }
});
const activitySchema = new mongoose_1.default.Schema({
    title: {
        type: String,
        required: [true, '活動標題必填'],
        maxlength: [nameMaxLength, `活動標題超過最大長度限制: ${nameMaxLength}`],
        trim: true
    },
    sponsorName: {
        type: String,
        required: [true, '主辦名稱必填'],
        maxlength: [nameMaxLength, `主辦名稱超過最大長度限制: ${nameMaxLength}`],
        trim: true
    },
    location: {
        type: String,
        required: [true, '活動地點必填'],
        maxlength: [nameMaxLength, `活動地點超過最大長度限制: ${nameMaxLength}`],
        trim: true
    },
    startDate: {
        type: Date,
        required: [true, '活動開始時間必填']
    },
    endDate: {
        type: Date,
        required: [true, '活動結束時間必填'],
        validate: [
            function () {
                if ((0, lodash_1.isDate)(this.endDate) && (0, lodash_1.isDate)(this.startDate)) {
                    return this.endDate > this.startDate;
                }
            },
            '活動結束時間必須晚於活動開始時間'
        ],
    },
    status: {
        type: Number,
        default: ActivityStatus.Unknown,
        enum: ActivityStatus
    },
    mainImageUrl: {
        type: String,
        required: [true, '主要宣傳圖片url必填'],
        trim: true
    },
    HtmlContent: {
        type: String,
        required: [true, '自定義活動內文必填'],
        trim: false
    },
    HtmlNotice: {
        type: String,
        required: [true, '自定義注意事項必填'],
        trim: false
    },
    schedules: {
        type: [activityScheduleSchema],
        validate: [
            function () {
                var _a;
                return !!(((_a = this.schedules) === null || _a === void 0 ? void 0 : _a.length) > 0);
            },
            '活動場次必填(至少一項)'
        ]
    },
    saleStartDate: {
        type: Date,
        required: [true, '售票開始時間必填']
    },
    saleEndDate: {
        type: Date,
        required: [true, '售票結束時間必填'],
        validate: [
            function () {
                if ((0, lodash_1.isDate)(this.saleEndDate) && (0, lodash_1.isDate)(this.saleStartDate)) {
                    return this.saleEndDate > this.saleStartDate;
                }
            },
            '售票結束時間必須晚於售票開始時間'
        ],
    },
});
const ActivityModel = mongoose_1.default.model('activities', activitySchema);
exports.default = ActivityModel;
