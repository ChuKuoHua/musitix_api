import mongoose, { Schema } from 'mongoose';
import isEmail from 'validator/lib/isEmail';

export interface Question {
  name: string;
  email: string;
  type: QuestionType;
  subject: string;
  content: string;

  isReplied: boolean; // 是否已回覆
  createdAt: Date;
}

export enum QuestionType {
  Unknown = 0,
  Booking = 1,
  Payment = 2,
  Ticket = 3,
  Refund = 4,
  Other = 5
}

const nameMaxLength = 100;
const contentMaxLength = 500;

const questionSchema: Schema<Question> = new mongoose.Schema({
  name: {
    type: String,
    required: [true, '聯絡人名稱必填'],
    maxlength: [nameMaxLength, `超過最大長度限制: ${nameMaxLength}`],
    trim: true
  },
  email: {
    type: String,
    required: [true, '聯絡人信箱必填'],
    maxlength: [nameMaxLength, `超過最大長度限制: ${nameMaxLength}`],
    validate: [isEmail, 'invalid email'],
    trim: true
  },
  type: {
    type: Number,
    enum: QuestionType,
    default: QuestionType.Unknown
  },
  subject: {
    type: String,
    required: [true, '主旨必填'],
    maxlength: [nameMaxLength, `超過最大長度限制: ${nameMaxLength}`],
    trim: true
  },
  content: {
    type: String,
    required: [true, '內容必填'],
    maxlength: [contentMaxLength, `超過最大長度限制: ${contentMaxLength}`],
    trim: true
  },

  isReplied: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const QuestionModel = mongoose.model<Question>('questions', questionSchema);

export default QuestionModel;
