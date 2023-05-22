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
const handleSuccess_1 = __importDefault(require("../../service/handleSuccess"));
const questionModel_1 = __importDefault(require("../../models/questionModel"));
const question = {
    // 新增問題
    post(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            const { name, email, type, subject, content } = req.body;
            const question = {
                name,
                email,
                type,
                subject,
                content
            };
            const newQuestion = yield questionModel_1.default.create(question);
            (0, handleSuccess_1.default)(res, '成功');
        });
    }
};
exports.default = question;
