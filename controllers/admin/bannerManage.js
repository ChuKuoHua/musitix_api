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
const bannerModel_1 = __importDefault(require("../../models/bannerModel"));
const activityModel_1 = __importDefault(require("../../models/activityModel"));
const bannerManage = {
    // NOTE banner table
    bannerList(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            const bannerList = yield bannerModel_1.default.find().lean();
            (0, handleSuccess_1.default)(res, bannerList);
        });
    },
    // NOTE 所有活動圖片
    activityAllImage(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            const activitys = yield activityModel_1.default.find({}, 'mainImageUrl').lean();
            (0, handleSuccess_1.default)(res, activitys);
        });
    },
    // NOTE 新增
    addBanner(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            const { title, image } = req.body;
            if (!image) {
                return (0, appError_1.default)(400, '請選擇圖片', next);
            }
            const data = yield bannerModel_1.default.findOne({ image: image });
            if (data) {
                return (0, appError_1.default)(400, '圖片已存在', next);
            }
            try {
                yield bannerModel_1.default.create({ title, image });
                (0, handleSuccess_1.default)(res, '新增成功');
            }
            catch (error) {
                return (0, appError_1.default)(500, '新增失敗', next);
            }
        });
    },
    // NOTE 刪除
    deleteBanner(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            const { id } = req.params;
            // 檢查有無此會員
            const bannerCheck = yield bannerModel_1.default.findById(id);
            if (!bannerCheck) {
                return (0, appError_1.default)(400, "查無此 id", next);
            }
            const data = yield bannerModel_1.default.deleteOne({ '_id': id });
            if (data) {
                (0, handleSuccess_1.default)(res, '已刪除');
            }
        });
    }
};
exports.default = bannerManage;
