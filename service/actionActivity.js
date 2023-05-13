"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const activityModel_1 = __importDefault(require("../models/activityModel"));
class ActivityService {
    getAllActivities() {
        return activityModel_1.default.find().exec();
    }
    getActivityById(id) {
        return activityModel_1.default.findById(id).exec();
    }
}
exports.default = ActivityService;
