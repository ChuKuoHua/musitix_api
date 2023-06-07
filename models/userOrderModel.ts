import mongoose, { Schema, Document, Types } from 'mongoose';

enum OrderStatus {
  Failed = 0, // 付款失敗,
  ReadyToUse = 1, // 可使用
  PendingPayment = 2, // 待付款
  Used = 3, // 已使用
  Expired = 4, // 已過期
  Refunded = 5, // 已退票
  InReview = 6 // 審核中
}

interface UserOrder {
  _id: mongoose.Schema.Types.ObjectId;
  buyer: string;
  cellPhone: string;
  email: string;
  address: string;
  orderNumber: string;
  orderStatus: OrderStatus;
  orderCreateDate: Date;
  memo: string;
  ticketList: Ticket[];
  activityInfo: {
    title: string;
    sponsorName: string;
    location: string;
    address: string;
    startDate: Date;
    endDate: Date;
    mainImageUrl: string;
    totalAmount: number;
    ticketTotalCount: number;
    ticketCategories: {
      categoryName: string;
      price: number;
    }[];
  };
  activityId?: mongoose.Schema.Types.ObjectId;
  userId?: mongoose.Schema.Types.ObjectId;
  payTime?: Date;
  tradeNo?: string;
  paymentType?: string;
  escrowBank?: string;
  Card6No?: string;
  Card4No?: string;
}



export interface Ticket {
  _id: Types.ObjectId; 
  scheduleName: string;
  categoryName: string;
  price: number;
  ticketNumber: string;
  ticketStatus: TicketStatus;
  qrCode: string;
}


enum TicketStatus {
  Failed = 0, // 付款失敗
  ReadyToUse = 1, // 可使用
  PendingPayment = 2, // 待付款
  Used = 3, // 已使用
  Expired = 4, // 已過期
  Refunded = 5, // 已退票
  InReview = 6 // 審核中
}


const ticketSchema: Schema<Ticket> = new Schema({
  scheduleName: { type: String, required: true },
  categoryName: { type: String, required: true },
  price: { type: Number, required: true },
  ticketNumber: { type: String, required: true },
  ticketStatus: {
    type: Number,
    default: TicketStatus.PendingPayment,
    enum: TicketStatus, required: true
  },
  qrCode: { type: String, required: true }
});

const UserOrderSchema: Schema = new Schema({
  buyer: { type: String, required: true },
  cellPhone: { type: String, required: true },
  email: { type: String, required: true },
  address: { type: String, required: true },
  orderNumber: { type: String, required: true },
  orderStatus: { type: Number,
    default: OrderStatus.PendingPayment,
    enum: OrderStatus, required: true},
  orderCreateDate: { type: Date, default: Date.now },
  memo: { type: String },
  ticketList: { type: [ticketSchema], required: true },
  activityInfo: {
    title: { type: String},
    sponsorName: { type: String},
    location: { type: String},
    address: { type: String},
    startDate: { type: Date},
    endDate: { type: Date},
    mainImageUrl: { type: String},
    totalAmount: { type: Number},
    ticketTotalCount: { type: Number},
    ticketCategories: [{
      categoryName: { type: String},
      price: { type: Number}
    }]
  },
  activityId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'activities'
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'user'
  },
  payTime: { type: Date },
  tradeNo: { type: String },
  paymentType: { type: String },
  escrowBank: { type: String },
  Card6No: { type: String },
  Card4No: { type: String }
});

const UserOrderModel = mongoose.model<UserOrder>('userorder', UserOrderSchema);

export { UserOrderModel, UserOrder, TicketStatus, OrderStatus };