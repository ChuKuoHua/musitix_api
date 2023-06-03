"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.mailOptions = exports.transporter = void 0;
const nodemailer_1 = __importDefault(require("nodemailer"));
const { google } = require("googleapis");
const OAuth2 = google.auth.OAuth2;
// 建立 accessToken
const oauth2Client = new OAuth2(process.env.CLINENTID, process.env.CLINENTSECRET, 'https://developers.google.com/oauthplayground');
oauth2Client.setCredentials({
    refresh_token: process.env.REFRESHTOKEN
});
const accessToken = oauth2Client.getAccessToken();
const transporter = nodemailer_1.default.createTransport({
    service: 'gmail',
    auth: {
        type: 'OAuth2',
        user: process.env.ACCOUNT,
        clientId: process.env.CLINENTID,
        clientSecret: process.env.CLINENTSECRET,
        refreshToken: process.env.REFRESHTOKEN,
        accessToken: accessToken || '',
    },
    tls: {
        rejectUnauthorized: false
    }
});
exports.transporter = transporter;
const mailOptions = (email, title, content) => {
    return {
        form: process.env.ACCOUNT,
        to: email,
        subject: title,
        html: content,
    };
};
exports.mailOptions = mailOptions;
