import mongoose, { Schema, Document } from 'mongoose';

export interface Profiles {
  password: string;
  username: string;
}

export interface IUser extends Document {
  username: string;
  email: string;
  account?: string;
  googleId?: string;
  password: string;
  picture?: string;
  role: string;
  loginType: string;
  isDisabled: Boolean;
  createdAt?: Date;
  updatedAt?: Date;
  Timestamp?: Date;
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
    type: Buffer,
    default: ""
  },
  role:{
    type: String,
    default: "user",
    enum:["user","host"]
  },
  loginType: {
    type: String,
    default: "normal",
    enum:["normal","google"]
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
  // google 登入時間
  Timestamp: {
    type: Date,
    default: "",
    select: false
  },
});

const User = mongoose.model<IUser>('user', userSchema);

module.exports = User;