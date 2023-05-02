"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const userSchema = new mongoose_1.default.Schema({
    username: {
        type: String,
        required: [true, '請輸入您的名字']
    },
    email: {
        type: String,
        required: [true, '請輸入您的 Email'],
        unique: true,
        lowercase: true
    },
    // 後臺用帳號
    account: {
        type: String,
        select: false
    },
    // google ID
    googleId: {
        type: String,
        select: false
    },
    password: {
        type: String,
        required: [true, '請輸入密碼'],
        minlength: 8,
        select: false
    },
    picture: {
        type: String,
        default: ""
    },
    role: {
        type: String,
        default: "user",
        enum: ["user", "host"]
    },
    loginType: {
        type: String,
        default: "normal",
        enum: ["normal", "google"]
    },
    isDisabled: {
        type: Boolean,
        default: false
    },
    createdAt: {
        type: Date,
        default: Date.now,
        select: false
    },
    updatedAt: {
        type: Date,
        default: Date.now,
        select: false
    },
    // google 登入時間
    Timestamp: {
        type: Date,
        default: "",
        select: false
    },
    token: {
        type: String,
        default: ""
    }
});
const User = mongoose_1.default.model('user', userSchema);
exports.default = User;
