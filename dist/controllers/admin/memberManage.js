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
Object.defineProperty(exports, "__esModule", { value: true });
const handleSuccess = require('../../service/handleSuccess');
const appError = require('../../service/appError');
const User = require('../../models/users');
const memberManage = {
    // NOTE 會員資料
    usersList(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            // asc 遞增(由小到大，由舊到新) createdAt ; 
            // desc 遞減(由大到小、由新到舊) "-createdAt"
            const timeSort = req.query.timeSort === "asc" ? "createdAt" : "-createdAt";
            const q = req.query.q !== undefined ? new RegExp(req.query.q)
                : '';
            // // 模糊搜尋多欄位
            const data = yield User.find({
                $or: [
                    { id: { $regex: q } },
                    { username: { $regex: q } },
                    { email: { $regex: q } }
                ],
                role: "user"
            }).sort(timeSort);
            handleSuccess(res, data);
        });
    },
    // NOTE 會員停用/啟用
    invalidUser(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            let { userId, isDisabled } = req.body;
            // 檢查有無此會員
            const userCheck = yield User.findOne({
                "_id": userId
            });
            if (!userCheck) {
                return next(appError(400, "查無此 id", next));
            }
            yield User.findByIdAndUpdate(userId, {
                $set: {
                    isDisabled: isDisabled
                }
            });
            if (isDisabled) {
                handleSuccess(res, '此會員已停用');
            }
            else {
                handleSuccess(res, '此會員已啟用');
            }
        });
    },
};
module.exports = memberManage;
