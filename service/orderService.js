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
exports.generateQRCode = exports.generateOrderNumber = void 0;
const qrcode_1 = __importDefault(require("qrcode"));
function generateOrderNumber() {
    const timestamp = new Date().getTime(); //取得時間
    const randomSuffix = Math.floor(Math.random() * 10000).toString().padStart(4, '0'); //產生 4 位數的隨機數字
    const orderNumber = `FEST2023_${timestamp}_${randomSuffix}`; //組合訂單編號
    return orderNumber;
}
exports.generateOrderNumber = generateOrderNumber;
// QRcode
function generateQRCode(text) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const qrCode = yield qrcode_1.default.toDataURL(text);
            return qrCode;
        }
        catch (error) {
            throw new Error('Failed to generate QR code');
        }
    });
}
exports.generateQRCode = generateQRCode;
