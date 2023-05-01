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
const appError_1 = __importDefault(require("../../service/appError"));
const handleSuccess_1 = __importDefault(require("../../service/handleSuccess"));
const users_1 = __importDefault(require("../../models/users"));
const memberManage = {
    // NOTE 會員資料
    usersList(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            // asc 遞增(由小到大，由舊到新) createdAt ; 
            // desc 遞減(由大到小、由新到舊) "-createdAt"
            const timeSort = req.query.timeSort === "asc" ? "createdAt" : "-createdAt";
            const q = req.query.q !== undefined ? new RegExp(req.query.q)
                : '';
            // 用來判斷作廢或未作廢資料
            const disabled = req.query.disabled ? req.query.disabled : false;
            const data = yield users_1.default.find({
                // 模糊搜尋多欄位
                $or: [
                    { id: { $regex: q } },
                    { username: { $regex: q } },
                    { email: { $regex: q } },
                ],
                role: "user",
                isDisabled: disabled
            }).sort(timeSort);
            (0, handleSuccess_1.default)(res, data);
        });
    },
    // NOTE 會員停用/啟用
    invalidUser(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            let { userId, isDisabled } = req.body;
            // 檢查有無此會員
            const userCheck = yield users_1.default.findOne({
                "_id": userId
            });
            if (!userCheck) {
                return next((0, appError_1.default)(400, "查無此 id", next));
            }
            yield users_1.default.findByIdAndUpdate(userId, {
                $set: {
                    isDisabled: isDisabled
                }
            });
            if (isDisabled) {
                (0, handleSuccess_1.default)(res, '此會員已停用');
            }
            else {
                (0, handleSuccess_1.default)(res, '此會員已啟用');
            }
        });
    },
};
exports.default = memberManage;
