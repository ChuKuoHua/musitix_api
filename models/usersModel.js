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
}, {
    statics: {
        findOrCreateWithGoogle(doc) {
            return __awaiter(this, void 0, void 0, function* () {
                let result = yield this.findOne({ googleId: doc.googleId });
                if (result) {
                    return result;
                }
                else {
                    result = new this(doc);
                    return yield result.save();
                }
            });
        }
    }
});
const User = mongoose_1.default.model('user', userSchema);
exports.default = User;
