"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 *
 * @param httpStatus http 狀態
 * @param errorMessage 錯誤資訊
 * @param next
 */
const appError = (httpStatus, errorMessage, next) => {
    const error = new Error(errorMessage);
    error.statusCode = httpStatus;
    error.isOperational = true; // 判斷是否為自定義的錯誤
    next(error);
};
module.exports = appError;
