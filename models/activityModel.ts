import mongoose, { Schema } from 'mongoose';
import { isDate } from 'lodash';

export interface ActivityBase {
  title: string;
  sponsorName: string;
  location: string;
  address: string;
  mapUrl: string;
  startDate: Date;
  endDate: Date;
  mainImageUrl: string;
  HtmlContent: string;
  HtmlNotice: string;
  schedules: ActivitySchedule[];

  saleStartDate: Date;
  saleEndDate: Date;
}

export interface Activity extends ActivityBase {
  status: ActivityStatus;

  minPrice: number;
  maxPrice: number;
}

export interface CreateActivityCommand extends ActivityBase {
}

// 活動狀態
export enum ActivityStatus {
  Unknown = 0,
  Unpublished = 1, // 未上架
  Published = 2, // 已上架
  Ended = 3, // 已結束
  Canceled = 4, // 已取消
  Discontinued = 5 // 已停辦
}

// 活動場次
interface ActivitySchedule {
  _id: mongoose.Schema.Types.ObjectId;
  scheduleName: string;
  ticketCategories: TicketCategory[];

  startTime: Date;
  endTime: Date;
  saleStartTime: Date;
  saleEndTime: Date;
}

// 票種
interface TicketCategory {
  _id: mongoose.Schema.Types.ObjectId;
  categoryName: string;
  price: number;
  totalQuantity: number;
  remainingQuantity: number;
}

const nameMaxLength = 100;

const ticketCategorySchema: Schema<TicketCategory> = new mongoose.Schema({
  categoryName: {
    type: String,
    required: [true, '票種名稱必填'],
    maxlength: [nameMaxLength, `票種名稱超過最大長度限制: ${nameMaxLength}`],
    trim: true
  },
  price: {
    type: Number,
    required: [true, '票價必填'],
    min: [0, `票價最小值: 0`],
    trim: true
  },
  totalQuantity: {
    type: Number,
    required: [true, '票券總數量必填'],
    min: [1, `票券總數量最小值: 1`],
    trim: true
  },
  remainingQuantity: {
    type: Number,
    required: [true, '票券剩餘數量必填'],
    min: [0, `票券剩餘數量最小值: 0`],
    trim: true
  },
});

const activityScheduleSchema: Schema<ActivitySchedule> = new mongoose.Schema({
  scheduleName: {
    type: String,
    required: [true, '場次名稱必填'],
    maxlength: [nameMaxLength, `場次名稱超過最大長度限制: ${nameMaxLength}`],
    trim: true
  },
  ticketCategories: {
    type: [ticketCategorySchema],
    validate: [
      function (this: ActivitySchedule) {
        return !!(this.ticketCategories?.length > 0);
      },
      '票種必填(至少一項)'
    ]
  },
  startTime: {
    type: Date,
    required: [true, '場次開始時間必填']
  },
  endTime: {
    type: Date,
    required: [true, '場次結束時間必填'],
    validate: [
      function (this: ActivitySchedule) {
        if (isDate(this.endTime) && isDate(this.startTime)) {
          return this.endTime > this.startTime;
        }
      },
      '場次結束時間必須晚於場次開始時間'
    ],
  },
  saleStartTime: {
    type: Date,
    required: [true, '場次開始時間必填']
  },
  saleEndTime: {
    type: Date,
    required: [true, '場次結束時間必填'],
    validate: [
      function (this: ActivitySchedule) {
        if (isDate(this.saleEndTime) && isDate(this.saleStartTime)) {
          return this.saleEndTime > this.saleStartTime;
        }
      },
      '場次結束時間必須晚於場次開始時間'
    ],
  },
});

const activitySchema: Schema<Activity> = new mongoose.Schema({
  title: {
    type: String,
    required: [true, '活動標題必填'],
    maxlength: [nameMaxLength, `活動標題超過最大長度限制: ${nameMaxLength}`],
    trim: true
  },
  sponsorName: {
    type: String,
    required: [true, '主辦名稱必填'],
    maxlength: [nameMaxLength, `主辦名稱超過最大長度限制: ${nameMaxLength}`],
    trim: true
  },
  location: {
    type: String,
    required: [true, '活動地點必填'],
    maxlength: [nameMaxLength, `活動地點超過最大長度限制: ${nameMaxLength}`],
    trim: true
  },
  address: {
    type: String,
    required: [true, '活動地址必填'],
    trim: true
  },
  mapUrl: {
    type: String,
    required: [true, '地圖url必填'],
    trim: true
  },
  startDate: {
    type: Date,
    required: [true, '活動開始時間必填']
  },
  endDate: {
    type: Date,
    required: [true, '活動結束時間必填'],
    validate: [
      function (this: Activity) {
        if (isDate(this.endDate) && isDate(this.startDate)) {
          return this.endDate > this.startDate;
        }
      },
      '活動結束時間必須晚於活動開始時間'
    ],
  },
  status: {
    type: Number,
    default: ActivityStatus.Unknown,
    enum: ActivityStatus
  },
  mainImageUrl: {
    type: String,
    required: [true, '主要宣傳圖片url必填'],
    trim: true
  },
  HtmlContent: {
    type: String,
    required: [true, '自定義活動內文必填'],
    trim: false
  },
  HtmlNotice: {
    type: String,
    required: [true, '自定義注意事項必填'],
    trim: false
  },
  schedules: {
    type: [activityScheduleSchema],
    validate: [
      function (this: Activity) {
        return !!(this.schedules?.length > 0);
      },
      '活動場次必填(至少一項)'
    ]
  },
  saleStartDate: {
    type: Date,
    required: [true, '售票開始時間必填']
  },
  saleEndDate: {
    type: Date,
    required: [true, '售票結束時間必填'],
    validate: [
      function (this: Activity) {
        if (isDate(this.saleEndDate) && isDate(this.saleStartDate)) {
          return this.saleEndDate > this.saleStartDate;
        }
      },
      '售票結束時間必須晚於售票開始時間'
    ],
  },
  minPrice: {
    type: Number
  },
  maxPrice: {
    type: Number
  }
});

const ActivityModel = mongoose.model<Activity>('activities', activitySchema);

export default ActivityModel;
