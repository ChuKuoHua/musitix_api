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
const uuid_1 = require("uuid");
const firebase_1 = __importDefault(require("../../middleware/firebase"));
const activityModel_1 = __importStar(require("../../models/activityModel"));
const handleSuccess_1 = __importDefault(require("../../service/handleSuccess"));
const appError_1 = __importDefault(require("../../service/appError"));
const actionActivity_1 = __importDefault(require("../../service/actionActivity"));
const bucket = firebase_1.default.storage().bucket();
const activityService = new actionActivity_1.default();
const activityManage = {
    createActivity(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            if (req.body) {
                const { title, sponsorName, location, mapUrl, startDate, endDate, mainImageUrl, HtmlContent, HtmlNotice, schedules, saleStartDate, saleEndDate } = req.body;
                const status = activityModel_1.ActivityStatus.Unpublished;
                const priceList = schedules.flatMap(schedule => schedule.ticketCategories.map(ticketCategory => ticketCategory.price));
                const minPrice = Math.min(...priceList);
                const maxPrice = Math.max(...priceList);
                const activity = {
                    title, sponsorName, location, mapUrl, startDate, endDate, mainImageUrl,
                    HtmlContent, HtmlNotice, schedules, saleStartDate, saleEndDate,
                    status, minPrice, maxPrice
                };
                const newActivity = yield activityModel_1.default.create(activity);
                (0, handleSuccess_1.default)(res, newActivity);
            }
        });
    },
    updateActivity(req, res, next) {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            const _id = (_a = req.params) === null || _a === void 0 ? void 0 : _a.id;
            const oriActivity = yield activityModel_1.default.findOne({ _id });
            if (!oriActivity) {
                return (0, appError_1.default)(400, "查無此 id", next);
            }
            if (oriActivity.status !== activityModel_1.ActivityStatus.Unpublished) {
                return (0, appError_1.default)(400, "只能編輯未上架之活動", next);
            }
            if (req.body) {
                const { title, sponsorName, location, mapUrl, startDate, endDate, mainImageUrl, HtmlContent, HtmlNotice, schedules, saleStartDate, saleEndDate } = req.body;
                const status = activityModel_1.ActivityStatus.Unpublished;
                const priceList = schedules.flatMap(schedule => schedule.ticketCategories.map(ticketCategory => ticketCategory.price));
                const minPrice = Math.min(...priceList);
                const maxPrice = Math.max(...priceList);
                const activity = {
                    title, sponsorName, location, mapUrl, startDate, endDate, mainImageUrl,
                    HtmlContent, HtmlNotice, schedules, saleStartDate, saleEndDate,
                    status, minPrice, maxPrice
                };
                const newActivity = yield activityModel_1.default.findByIdAndUpdate(_id, activity, { new: true });
                (0, handleSuccess_1.default)(res, newActivity);
            }
        });
    },
    publishActivity(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            const _id = req.params.id;
            const oriActivity = yield activityModel_1.default.findOne({ _id });
            if (!oriActivity) {
                return (0, appError_1.default)(400, "查無此 id", next);
            }
            switch (oriActivity.status) {
                case activityModel_1.ActivityStatus.Unpublished:
                    const newActivity = yield activityModel_1.default.findByIdAndUpdate(_id, { status: activityModel_1.ActivityStatus.Published }, { new: true });
                    return (0, handleSuccess_1.default)(res, newActivity);
                default:
                    return (0, appError_1.default)(400, "只能上架狀態為「未上架」的活動", next);
            }
        });
    },
    cancelActivity(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            const _id = req.params.id;
            const oriActivity = yield activityModel_1.default.findOne({ _id });
            if (!oriActivity) {
                return (0, appError_1.default)(400, "查無此 id", next);
            }
            switch (oriActivity.status) {
                case activityModel_1.ActivityStatus.Unpublished: {
                    const newActivity = yield activityModel_1.default.findByIdAndUpdate(_id, { status: activityModel_1.ActivityStatus.Canceled }, { new: true });
                    return (0, handleSuccess_1.default)(res, newActivity);
                }
                case activityModel_1.ActivityStatus.Published: {
                    // const newActivity = await ActivityModel.findByIdAndUpdate(_id, { status: ActivityStatus.Canceled }, { new: true });
                    return (0, appError_1.default)(400, "目前不支援停辦已上架的活動，請洽系統管理員", next);
                }
                default:
                    return (0, appError_1.default)(400, "只能取消狀態為「未上架」的活動", next);
            }
        });
    },
    uploadActivityImage(req, res, next) {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            if (!((_a = req.files) === null || _a === void 0 ? void 0 : _a.length)) {
                return (0, appError_1.default)(400, "尚未上傳檔案", next);
            }
            // 取得上傳的檔案資訊列表裡面的第一個檔案
            const file = req.files[0];
            // 基於檔案的原始名稱建立一個 blob 物件
            const blob = bucket.file(`images/activities/${(0, uuid_1.v4)()}.${file.originalname.split('.').pop()}`);
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
                return next((0, appError_1.default)("500", '上傳失敗', next));
            });
            // 將檔案的 buffer 寫入 blobStream
            blobStream.end(file.buffer);
        });
    },
    getAllActivities(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            const activities = yield activityService.getAllActivities();
            (0, handleSuccess_1.default)(res, activities);
        });
    },
    getActivityById(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            const { id } = req.params;
            try {
                const activity = yield activityService.getActivityById(id);
                if (activity) {
                    (0, handleSuccess_1.default)(res, activity);
                }
                else {
                    (0, appError_1.default)(404, "Activity not found", next);
                }
            }
            catch (error) {
                (0, appError_1.default)(500, "Internal Server Error", next);
            }
        });
    },
    getPublishedActivities(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const activities = yield activityModel_1.default.find().lean();
                const hotActivities = activities.map(activity => ({
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
                    const sevenDaysFromNow = new Date();
                    sevenDaysFromNow.setDate(sevenDaysFromNow.getDate() + 7);
                    return saleStartDate <= sevenDaysFromNow;
                });
                const recentActivities = activities.filter(activity => {
                    const startDate = new Date(activity.startDate);
                    const sevenDaysAgo = new Date();
                    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
                    return startDate <= sevenDaysAgo;
                });
                const response = {
                    hotActivities,
                    upcomingActivities,
                    recentActivities
                };
                (0, handleSuccess_1.default)(res, response);
            }
            catch (error) {
                return (0, appError_1.default)(500, "Failed to retrieve activities", next);
            }
        });
    }
};
exports.default = activityManage;
