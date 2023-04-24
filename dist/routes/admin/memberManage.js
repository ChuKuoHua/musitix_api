"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const router = express_1.default.Router();
const handleErrorAsync = require('../../service/handleErrorAsync');
const memberControllers = require('../../controllers/admin/memberManage');
const { isAdmin } = require('../../middleware/admin');
// 全部會員資料
router.get('/users_list', isAdmin, handleErrorAsync(memberControllers.usersList));
// 會員停用/啟用
router.delete('/invalid_user', isAdmin, handleErrorAsync(memberControllers.invalidUser));
module.exports = router;
