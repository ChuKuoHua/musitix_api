"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const router = express_1.default.Router();
const handleErrorAsync = require('../../service/handleErrorAsync');
const userControllers = require('../../controllers/admin/admin');
const { isAdmin } = require('../../middleware/admin');
// 登入
router.post('/login', handleErrorAsync(userControllers.login));
// 註冊
router.post('/register', handleErrorAsync(userControllers.register));
// 登出
router.post('/logout', isAdmin, handleErrorAsync(userControllers.logout));
module.exports = router;
