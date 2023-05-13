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
const activityModel_1 = __importDefault(require("../../models/activityModel"));
const handleSuccess_1 = __importDefault(require("../../service/handleSuccess"));
const activity = {
    getPublishedActivities(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
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
        });
    }
};
exports.default = activity;
