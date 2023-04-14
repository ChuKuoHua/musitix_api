const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config({path: './.env'})
const pwd = process.env.DATABASE_PASSWORD ? process.env.DATABASE_PASSWORD : ''

const DB: string = process.env.DATABASE!.replace(
  '<PASSWORD>',
  pwd
)

// 連接資料庫
mongoose.connect(DB)
  .then(() => console.log('資料庫連線成功'))
  .catch((error: Error) => console.log(error));