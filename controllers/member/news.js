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
const latestnewsModel_1 = __importDefault(require("../../models/latestnewsModel"));
const latestNew = {
    // GET 最新消息
    getLatestNews(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            const latestNews = yield latestnewsModel_1.default.find().lean();
            const Result = latestNews.map(latestNews => ({
                id: latestNews._id,
                title: latestNews.title,
                date: latestNews.updatedAt,
                content: latestNews.content,
            }));
            (0, handleSuccess_1.default)(res, Result);
        });
    }
};
exports.default = latestNew;
