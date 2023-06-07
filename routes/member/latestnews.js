"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const handleErrorAsync_1 = __importDefault(require("../../service/handleErrorAsync"));
const news_1 = __importDefault(require("../../controllers/member/news"));
const router = express_1.default.Router();
// 最新消息
router.get('/', (0, handleErrorAsync_1.default)(news_1.default.getLatestNews));
exports.default = router;
