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
const activityModel_1 = __importStar(require("../../models/activityModel"));
const handleSuccess_1 = __importDefault(require("../../service/handleSuccess"));
const appError_1 = __importDefault(require("../../service/appError"));
const activity = {
    getPublishedActivities(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            const activities = yield activityModel_1.default.find().lean();
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
                const sevenDaysFromNow = new Date();
                sevenDaysFromNow.setDate(sevenDaysFromNow.getDate() + 7);
                return saleStartDate <= sevenDaysFromNow;
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
                const sevenDaysAgo = new Date();
                sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
                return startDate <= sevenDaysAgo;
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
                status: { $in: [activityModel_1.ActivityStatus.Published, activityModel_1.ActivityStatus.Ended, activityModel_1.ActivityStatus.Discontinued] }
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
            (0, handleSuccess_1.default)(res, activities);
        });
    },
    getActivityById(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            const { id } = req.params;
            const activity = yield activityModel_1.default.findById(id).lean();
            (0, handleSuccess_1.default)(res, activity);
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
        return __awaiter(this, void 0, void 0, function* () {
        });
    }
};
exports.default = activity;
