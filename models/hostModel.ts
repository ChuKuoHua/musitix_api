import mongoose, { Schema, Document } from 'mongoose';

export interface IHost extends Document {
  username: string;
  email: string;
  account: string;
  password: string;
  picture?: string;
  role: string;
  isDisabled: Boolean;
  createdAt?: Date;
  updatedAt?: Date;
  // token?: string;
}

const userSchema: Schema = new mongoose.Schema({
  username: {
    type: String,
    required: [true, '請輸入您的名字']
  },
  email: {
    type: String,
    required: [true, '請輸入您的 Email'],
    unique: true,
    lowercase: true
  },
  // 後臺用帳號
  account: {
    type: String,
    select: false
  },
  // google ID
  googleId: {
    type: String,
    select: false
  },
  password:{
    type: String,
    required: [true,'請輸入密碼'],
    minlength: 8,
    select: false
  },
  picture: {
    type: String,
    default: ""
  },
  role:{
    type: String,
    default: "host",
    enum:["host","staff"]
  },
  isDisabled: {     
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now,
    select: false
  },
  updatedAt: {
    type: Date,
    default: Date.now,
    select: false
  },
  // token: {
  //   type: String,
  //   default: ""
  // }
});

const Host = mongoose.model<IHost>('host', userSchema);

export default Host;