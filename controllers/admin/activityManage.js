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
const activityManage = {
    createActivity(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            if (req.body) {
                const { title, sponsorName, location, startDate, endDate, mainImageUrl, HtmlContent, HtmlNotice, schedules, saleStartDate, saleEndDate } = req.body;
                const status = activityModel_1.ActivityStatus.Unpublished;
                const activity = {
                    title, sponsorName, location, startDate, endDate, mainImageUrl,
                    HtmlContent, HtmlNotice, schedules, saleStartDate, saleEndDate,
                    status
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
                const { title, sponsorName, location, startDate, endDate, mainImageUrl, HtmlContent, HtmlNotice, schedules, saleStartDate, saleEndDate } = req.body;
                const status = activityModel_1.ActivityStatus.Unpublished;
                const activity = {
                    title, sponsorName, location, startDate, endDate, mainImageUrl,
                    HtmlContent, HtmlNotice, schedules, saleStartDate, saleEndDate,
                    status
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
    }
};
exports.default = activityManage;
