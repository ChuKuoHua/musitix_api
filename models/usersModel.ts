import mongoose, { Schema, Document, Model } from 'mongoose';

import { DocFromGoogle } from './otherModel';

export interface Profiles {
  _id: string;
  username: string;
  picture?: string;
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
  // token?: string;

  preFilledInfo: PreFilledInfo;
}

interface IUserModel extends Model<IUser> {
  findOrCreateWithGoogle(doc: DocFromGoogle): Promise<mongoose.Document<IUser>>;
}

// 預填資料
export interface PreFilledInfo {
  buyer?: string;
  email?: string;
  cellPhone?: string;
  address?: string;
}

const preFilledInfoSchema: Schema<PreFilledInfo> = new mongoose.Schema({
  email: String,
  buyer: String,
  cellPhone: String,
  address: String,
}, { _id: false });

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
  password: {
    type: String,
    minlength: 8,
    select: false
  },
  picture: {
    type: String,
    default: ""
  },
  role: {
    type: String,
    default: "user",
    enum: ["user"]
  },
  loginType: {
    type: String,
    default: "normal",
    enum: ["normal", "google"]
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
  // token: {
  //   type: String,
  //   default: ""
  // }

  preFilledInfo: {
    type: preFilledInfoSchema,
    default: function (this: IUser) {
      const preFilledInfo = {
        email: this.email,
        buyer: '',
        cellPhone: '',
        address: ''
      }
      return preFilledInfo;
    }
  }
},
  {
    statics: {
      async findOrCreateWithGoogle(doc: DocFromGoogle): Promise<mongoose.Document> {
        let result = await this.findOne({ email: doc.email });
        if (result) {
          return result;
        } else {
          result = new this(doc);
          result.loginType = 'google';
          return await result.save();
        }
      }
    }
  }
);

const User = mongoose.model<IUser, IUserModel>('user', userSchema);

export default User;
