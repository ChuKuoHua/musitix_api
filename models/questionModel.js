"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.QuestionType = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const isEmail_1 = __importDefault(require("validator/lib/isEmail"));
var QuestionType;
(function (QuestionType) {
    QuestionType[QuestionType["Unknown"] = 0] = "Unknown";
    QuestionType[QuestionType["Booking"] = 1] = "Booking";
    QuestionType[QuestionType["Payment"] = 2] = "Payment";
    QuestionType[QuestionType["Ticket"] = 3] = "Ticket";
    QuestionType[QuestionType["Refund"] = 4] = "Refund";
    QuestionType[QuestionType["Other"] = 5] = "Other";
})(QuestionType = exports.QuestionType || (exports.QuestionType = {}));
const nameMaxLength = 100;
const contentMaxLength = 500;
const questionSchema = new mongoose_1.default.Schema({
    name: {
        type: String,
        required: [true, '聯絡人名稱必填'],
        maxlength: [nameMaxLength, `超過最大長度限制: ${nameMaxLength}`],
        trim: true
    },
    email: {
        type: String,
        required: [true, '聯絡人信箱必填'],
        maxlength: [nameMaxLength, `超過最大長度限制: ${nameMaxLength}`],
        validate: [isEmail_1.default, 'invalid email'],
        trim: true
    },
    type: {
        type: Number,
        enum: QuestionType,
        default: QuestionType.Unknown
    },
    subject: {
        type: String,
        required: [true, '主旨必填'],
        maxlength: [nameMaxLength, `超過最大長度限制: ${nameMaxLength}`],
        trim: true
    },
    content: {
        type: String,
        required: [true, '內容必填'],
        maxlength: [contentMaxLength, `超過最大長度限制: ${contentMaxLength}`],
        trim: true
    },
    isReplied: {
        type: Boolean,
        default: false
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});
const QuestionModel = mongoose_1.default.model('questions', questionSchema);
exports.default = QuestionModel;
