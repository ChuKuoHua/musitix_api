"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkRegister = exports.checkPwd = exports.checkPwdFormat = void 0;
const validator = require('validator');
const regex = /^(?=.*[a-z])(?=.*[A-Z])/;
// 驗證密碼格式
const checkPwdFormat = (pwd) => {
    const errorMsg = [];
    if (pwd.length < 8) {
        errorMsg.push("密碼需大於 8 個字元");
    }
    if (!regex.test(pwd)) {
        errorMsg.push("密碼需為一個大寫一個小寫英文跟數字組成");
    }
    return errorMsg;
};
exports.checkPwdFormat = checkPwdFormat;
// 檢查密碼
const checkPwd = (pwd, confirmPwd) => {
    const pwdError = checkPwdFormat(pwd);
    if (pwdError.length > 0) {
        return pwdError;
    }
    // 確認密碼
    if (pwd !== confirmPwd) {
        return "密碼不一致";
    }
};
exports.checkPwd = checkPwd;
// 檢查註冊資料
const checkRegister = (req) => {
    const { email, username, password, confirmPassword } = req.body;
    const errorMsg = [];
    // 內容不可為空
    if (!email || !username || !password || !confirmPassword) {
        return "欄位未填寫正確！";
    }
    // 是否為 Email
    if (!validator.isEmail(email)) {
        errorMsg.push("Email 格式不正確");
    }
    const pwdError = checkPwd(password, confirmPassword);
    if (pwdError) {
        errorMsg.push(pwdError);
    }
    return errorMsg;
};
exports.checkRegister = checkRegister;
