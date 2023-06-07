"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const latesnewsSchema = new mongoose_1.default.Schema({
    title: { type: String, required: true },
    content: { type: String, required: true },
    updatedAt: {
        type: Date,
        default: Date.now,
    },
    messageTypes: { type: String, required: true },
});
const LatestNews = mongoose_1.default.model('latestnews', latesnewsSchema);
exports.default = LatestNews;
