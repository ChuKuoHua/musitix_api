"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const bannerSchema = new mongoose_1.default.Schema({
    activity_id: { type: String, required: true },
    activity_title: { type: String, required: true },
    image: { type: String, required: true },
    createdAt: {
        type: Date,
        default: Date.now,
        select: false
    },
});
const Banner = mongoose_1.default.model('banner', bannerSchema);
exports.default = Banner;
