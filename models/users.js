"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const preFilledInfoSchema = new mongoose_1.default.Schema({
    email: String,
    buyer: String,
    cellPhone: String,
    address: String,
}, { _id: false });
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
        enum: ["user"]
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
    // token: {
    //   type: String,
    //   default: ""
    // }
    preFilledInfo: {
        type: preFilledInfoSchema,
        default: function () {
            const preFilledInfo = {
                email: this.email,
                buyer: '',
                cellPhone: '',
                address: ''
            };
            return preFilledInfo;
        }
    }
});
const User = mongoose_1.default.model('user', userSchema);
exports.default = User;
