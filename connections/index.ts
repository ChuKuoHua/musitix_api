const mongoose = require('mongoose');
const dotenv = require('dotenv')
dotenv.config({path: './.env'});

let dataBase = process.env.DATABASE_DEV;
let DBPassword: string | undefined = ''

if(process.env.NODE_ENV !== 'dev') {
  DBPassword = process.env.DATABASE_PASSWORD
  dataBase = process.env.DATABASE
}

const DB: string = dataBase!.replace(
  '<PASSWORD>',
  DBPassword!
)

// 連接資料庫
if(process.env.NODE_ENV !== 'test') {
  mongoose.connect(DB)
    .then(() => console.log('資料庫連線成功'))
    .catch((error: Error) => console.log(error));
} else {
  console.log('test Database');
}
