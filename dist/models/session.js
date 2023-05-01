"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const sessionSchema = new mongoose_1.default.Schema({
    session: {
        type: String
    },
    expires: {
        type: Date,
        default: Date.now,
        select: false
    },
});
const SessionController = mongoose_1.default.model('session', sessionSchema);
exports.default = SessionController;
