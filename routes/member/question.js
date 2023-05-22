"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const handleErrorAsync_1 = __importDefault(require("../../service/handleErrorAsync"));
const question_1 = __importDefault(require("../../controllers/member/question"));
const router = express_1.default.Router();
// 新增問題
router.post('/', (0, handleErrorAsync_1.default)(question_1.default.post));
exports.default = router;
