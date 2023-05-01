"use strict";
const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config({ path: './.env' });
let dataBase = process.env.DATABASE_DEV;
let DBPassword = '';
if (process.env.NODE_ENV !== 'dev') {
    DBPassword = process.env.DATABASE_PASSWORD;
    dataBase = process.env.DATABASE;
}
const DB = dataBase.replace('<PASSWORD>', DBPassword);
// 連接資料庫
mongoose.connect(DB)
    .then(() => console.log('資料庫連線成功'))
    .catch((error) => console.log(error));
