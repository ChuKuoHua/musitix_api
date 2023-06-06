import { Request, Response, NextFunction } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { GetSignedUrlConfig, GetSignedUrlCallback } from '@google-cloud/storage';

import firebaseAdmin from '../../middleware/firebase';
import ActivityModel, { Activity, ActivityStatus, CreateActivityCommand } from '../../models/activityModel';
import handleSuccess from '../../service/handleSuccess';
import appError from '../../service/appError';
import { imageRequest } from '../../models/otherModel';
import ActivityService from '../../service/actionActivity';
import { UserOrderModel, OrderStatus } from '../../models/userOrderModel';
import LatestNews from '../../models/latestnewsModel';

const bucket = firebaseAdmin.storage().bucket();
const activityService: ActivityService = new ActivityService();
const activityManage = {

  async createActivity(req: Request<any, any, CreateActivityCommand>, res: Response, next: NextFunction) {
    if (req.body) {
      const { title, sponsorName, location, address, mapUrl, startDate, endDate, mainImageUrl,
        HtmlContent, HtmlNotice, schedules, saleStartDate, saleEndDate } = req.body;
      const status: ActivityStatus = ActivityStatus.Unpublished;

      const priceList = schedules.flatMap(schedule => schedule.ticketCategories.map(ticketCategory => ticketCategory.price));
      const minPrice = Math.min(...priceList);
      const maxPrice = Math.max(...priceList);

      const activity: Activity = {
        title, sponsorName, location, address, mapUrl, startDate, endDate, mainImageUrl,
        HtmlContent, HtmlNotice, schedules, saleStartDate, saleEndDate,
        status, minPrice, maxPrice
      }
      const newActivity = await ActivityModel.create(activity);
      handleSuccess(res, newActivity);
    }
  },
  async updateActivity(req: Request<any, any, CreateActivityCommand>, res: Response, next: NextFunction) {
    const _id = req.params?.id;

    const oriActivity = await ActivityModel.findOne({ _id })

    if (!oriActivity) {
      return appError(400, "查無此 id", next);
    }

    if (oriActivity.status !== ActivityStatus.Unpublished) {
      return appError(400, "只能編輯未上架之活動", next);
    }

    if (req.body) {
      const { title, sponsorName, location, address, mapUrl, startDate, endDate, mainImageUrl,
        HtmlContent, HtmlNotice, schedules, saleStartDate, saleEndDate } = req.body;

      const status: ActivityStatus = ActivityStatus.Unpublished;

      const priceList = schedules.flatMap(schedule => schedule.ticketCategories.map(ticketCategory => ticketCategory.price));
      const minPrice = Math.min(...priceList);
      const maxPrice = Math.max(...priceList);

      const activity: Activity = {
        title, sponsorName, location, address, mapUrl, startDate, endDate, mainImageUrl,
        HtmlContent, HtmlNotice, schedules, saleStartDate, saleEndDate,
        status, minPrice, maxPrice
      }

      const newActivity = await ActivityModel.findByIdAndUpdate(_id, activity, { new: true });
      handleSuccess(res, newActivity);
    }
  },
  async publishActivity(req: Request, res: Response, next: NextFunction) {
    const _id = req.params.id;
    const oriActivity = await ActivityModel.findOne({ _id });

    if (!oriActivity) {
      return appError(400, "查無此 id", next);
    }

    switch (oriActivity.status) {
      case ActivityStatus.Unpublished:
        const newActivity = await ActivityModel.findByIdAndUpdate(_id, { status: ActivityStatus.Published }, { new: true });
        return handleSuccess(res, newActivity);
      default:
        return appError(400, "只能上架狀態為「未上架」的活動", next);
    }
  },
  async cancelActivity(req: Request, res: Response, next: NextFunction) {
    const _id = req.params.id;
    const oriActivity = await ActivityModel.findOne({ _id });

    if (!oriActivity) {
      return appError(400, "查無此 id", next);
    }

    switch (oriActivity.status) {
      case ActivityStatus.Unpublished: {
        const newActivity = await ActivityModel.findByIdAndUpdate(_id, { status: ActivityStatus.Canceled }, { new: true });
        return handleSuccess(res, newActivity);
      }
      case ActivityStatus.Published: {
        // const newActivity = await ActivityModel.findByIdAndUpdate(_id, { status: ActivityStatus.Canceled }, { new: true });
        return appError(400, "目前不支援停辦已上架的活動，請洽系統管理員", next);
      }
      default:
        return appError(400, "只能取消狀態為「未上架」的活動", next);
    }
  },
  async uploadActivityImage(req: imageRequest, res: Response, next: NextFunction) {
    if (!req.files?.length) {
      return appError(400, "尚未上傳檔案", next);
    }
    // 取得上傳的檔案資訊列表裡面的第一個檔案
    const file = req.files[0];
    // 基於檔案的原始名稱建立一個 blob 物件
    const blob = bucket.file(`images/activities/${uuidv4()}.${file.originalname.split('.').pop()}`);
    // 建立一個可以寫入 blob 的物件
    const blobStream = blob.createWriteStream()

    // 監聽上傳狀態，當上傳完成時，會觸發 finish 事件
    blobStream.on('finish', () => {
      // 設定檔案的存取權限
      const config: GetSignedUrlConfig = {
        action: 'read', // 權限
        expires: '12-31-2500', // 網址的有效期限
      };
      const callback: GetSignedUrlCallback = (err: Error | null, fileUrl?: string) => {
        return handleSuccess(res, fileUrl);
      };

      // 取得檔案的網址
      blob.getSignedUrl(config, callback);
    });

    // 如果上傳過程中發生錯誤，會觸發 error 事件
    blobStream.on('error', (err: Error) => {
      return next(appError("500", '上傳失敗', next));
    });

    // 將檔案的 buffer 寫入 blobStream
    blobStream.end(file.buffer);
  },
  async getAllActivities(req: Request, res: Response, next: NextFunction): Promise<void> {
    const activities = await activityService.getAllActivities();
    handleSuccess(res, activities)
  },
  async getActivityById(req: Request, res: Response, next: NextFunction): Promise<void> {
    const { id } = req.params;
    const activity = await activityService.getActivityById(id);
    if (activity) {
      handleSuccess(res, activity)
    } else {
      return appError(404, "Activity not found", next);
    }
  },
  async admittanceQrcode(req: Request, res: Response, next: NextFunction) {
    const { ticketId } = req.params;
    const ticketStatus = await UserOrderModel.findOne({
      "ticketList": {
        $elemMatch: {
          "ticketNumber": ticketId,
          "ticketStatus": 3
        }
      }
    });

    if(ticketStatus) {
      return appError(200, "票券已使用", next);
    }

    await UserOrderModel.updateOne({
      'ticketList.ticketNumber': ticketId
    }, {
      $set: {
        'orderStatus': OrderStatus.Used,
        'ticketList.$[elem].ticketStatus': OrderStatus.Used
      },
    },{ 
      arrayFilters: [{ "elem.ticketNumber": ticketId }]
    });

    const data = await UserOrderModel.findOne({
      'ticketList.ticketNumber': ticketId
    }, 'buyer cellPhone orderNumber address memo ticketList.$ activityInfo.title activityInfo.location activityInfo.address activityInfo.startDate activityInfo.endDate');
    if (data) {
      handleSuccess(res, data);
    } else {
      return appError(400, "查無此訂單", next);
    }
  },
  async getNewsById(req: Request, res: Response, next: NextFunction): Promise<void> {
    const { id } = req.params;
    const news = await LatestNews.findById(id);
    if (news) {
      handleSuccess(res, news)
    } else {
      return appError(404, "找不到此則消息", next);
    }
  },
  async getAllNews(req: Request, res: Response, next: NextFunction): Promise<void> {
    const news = await LatestNews.find();
    handleSuccess(res, news)
  },
  async createNews(req: Request, res: Response, next: NextFunction): Promise<void> {
    const { title, content, messageTypes} = req.body;
    const news = await LatestNews.create({title, content, messageTypes});
    handleSuccess(res, news)
  },
  async updateNews(req: Request, res: Response, next: NextFunction): Promise<void> {
    const { id } = req.params;
    const { title, content } = req.body;
    const news = await LatestNews.updateOne({ _id: id }, { title, content });
    handleSuccess(res, news)
  },
  async deleteNews(req: Request, res: Response, next: NextFunction): Promise<void> {
    const { id } = req.params;
    const news = await LatestNews.deleteOne({ _id: id });
    handleSuccess(res, news)
  },
  // 退票內容 api
  async getUserOrderRefund(req: Request, res: Response, next: NextFunction): Promise<void> {
    const { id } = req.params;
    const userOrder = await UserOrderModel.findById(id, 'buyer cellPhone orderNumber address memo email activityInfo.title activityInfo.location activityInfo.address activityInfo.startDate activityInfo.endDate activityInfo.totalAmount activityInfo.ticketTotalCount');
    
    handleSuccess(res, userOrder)
  }
}

export default activityManage;
