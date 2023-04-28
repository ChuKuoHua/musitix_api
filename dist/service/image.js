"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const multer_1 = __importDefault(require("multer"));
const path_1 = __importDefault(require("path"));
const upload = (0, multer_1.default)({
    limits: {
        fileSize: 2 * 1024 * 1024,
    },
    fileFilter(req, file, cb) {
        const ext = path_1.default.extname(file.originalname).toLowerCase();
        if (ext !== '.jpg' && ext !== '.png' && ext !== '.jpeg') {
            cb(new Error("檔案格式錯誤，僅限上傳 jpg、jpeg 與 png 格式。"));
        }
        cb(null, true);
    },
}).any();
module.exports = upload;
