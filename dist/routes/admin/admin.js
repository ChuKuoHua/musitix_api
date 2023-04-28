"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const handleErrorAsync_1 = __importDefault(require("../../service/handleErrorAsync"));
const admin_1 = require("../../middleware/admin");
const admin_2 = __importDefault(require("../../controllers/admin/admin"));
const router = express_1.default.Router();
// 登入
router.post('/login', (0, handleErrorAsync_1.default)(admin_2.default.login));
// 註冊
router.post('/register', (0, handleErrorAsync_1.default)(admin_2.default.register));
// 登出
router.post('/logout', admin_1.isAdmin, (0, handleErrorAsync_1.default)(admin_2.default.logout));
exports.default = router;
