import nodemailer from 'nodemailer';
import dayjs from 'dayjs';

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

const mailOptions = (email: string, token: string) => {
  const now = dayjs();
  const afterOneHour = now.add(1, 'hour');
  const time = afterOneHour.format('YYYY-MM-DD HH:mm:ss');

  return {
    form: process.env.ACCOUNT,
    to : email,
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
  }
};

export {
  transporter,
  mailOptions
};
