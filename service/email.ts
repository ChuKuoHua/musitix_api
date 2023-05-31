import nodemailer from 'nodemailer';

const { google } = require("googleapis");
const OAuth2 = google.auth.OAuth2;
// 建立 accessToken
const oauth2Client = new OAuth2(
  process.env.CLINENTID,
  process.env.CLINENTSECRET,
  'https://developers.google.com/oauthplayground'
);
oauth2Client.setCredentials({
  refresh_token: process.env.REFRESHTOKEN
});
const accessToken = oauth2Client.getAccessToken();

const transporter = nodemailer.createTransport({
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

const mailOptions = (email: string, title: string, content: string) => {
  return {
    form: process.env.ACCOUNT,
    to : email,
    subject: title,
    html: content,
  }
};

export {
  transporter,
  mailOptions
};
