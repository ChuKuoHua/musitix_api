"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.mailOptions = exports.transporter = void 0;
const nodemailer_1 = __importDefault(require("nodemailer"));
const dayjs_1 = __importDefault(require("dayjs"));
const transporter = nodemailer_1.default.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true,
    auth: {
        type: "OAuth2",
        user: process.env.ACCOUNT,
        clientId: process.env.CLINENTID,
        clientSecret: process.env.CLINENTSECRET,
        refreshToken: process.env.REFRESHTOKEN,
        accessToken: process.env.ACCESSTOKEN,
    },
    tls: {
        rejectUnauthorized: false // 忽略憑證錯誤
    }
});
exports.transporter = transporter;
const mailOptions = (email, token) => {
    const now = (0, dayjs_1.default)();
    const afterOneHour = now.add(1, 'hour');
    const time = afterOneHour.format('YYYY-MM-DD HH:mm:ss');
    return {
        form: process.env.ACCOUNT,
        to: email,
        subject: 'musitix 重設密碼連結',
        html: `
      <p>親愛的 musitix 會員您好</p>
      <p>
        您收到這封郵件是因為我們收到了您重設密碼的請求，請於 ${time} 前完成修改密碼。
      </p>
      <p>若您確定要重設密碼，請點擊以下連結：</p>
      <a
        href="${process.env.EMAILURL}${token}"
      >${process.env.EMAILURL}${token}</a>
      <p>此連結將會帶您前往密碼重設頁面。如果您未發出此請求，請忽略此郵件，您的密碼不會有任何更改。</p>
      <p>謝謝！</p>
      <p>musitix 活動主辦方</p>
    `,
    };
};
exports.mailOptions = mailOptions;
