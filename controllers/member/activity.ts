import { Request, Response, NextFunction } from 'express';
import { Types } from 'mongoose';
import ActivityModel, { Activity, ActivityStatus } from '../../models/activityModel';
import handleSuccess from '../../service/handleSuccess';
import appError from '../../service/appError';
import { TicketStatus, OrderStatus, Ticket, UserOrderModel, UserOrder } from '../../models/userOrderModel';
import { generateOrderNumber, generateQRCode } from '../../service/orderService';
import User from '../../models/usersModel';
import { AuthRequest } from '../../models/otherModel';
import { createMpgAesEncrypt, createMpgShaEncrypt } from '../../service/crypto';
const activity = {
  async getPublishedActivities(req: Request, res: Response, next: NextFunction): Promise<void> {
    const activities: Activity[] = await ActivityModel.find().lean();
    const oneMonthBefore = new Date();
    oneMonthBefore.setMonth(oneMonthBefore.getMonth() - 1);
    const currentDate = new Date();
    const oneMonthFromNow = new Date();
    oneMonthFromNow.setMonth(oneMonthFromNow.getMonth() + 1);

    const hotActivities = activities.map(activity => ({
      id: (activity as any)._id.toString(),
      title: activity.title,
      sponsorName: activity.sponsorName,
      startDate: activity.startDate,
      endDate: activity.endDate,
      minPrice: activity.minPrice,
      maxPrice: activity.maxPrice,
      mainImageUrl: activity.mainImageUrl,
      ticketCount: activity.schedules.reduce((total, schedule) => {
        return total + schedule.ticketCategories.reduce((sum, category) => sum + category.totalQuantity, 0);
      }, 0)
    }));

    const upcomingActivities = activities.filter(activity => {
      const saleStartDate = new Date(activity.saleStartDate);
      return currentDate <= saleStartDate && saleStartDate <= oneMonthFromNow;
    }).map(activity => ({
      id: (activity as any)._id.toString(),
      title: activity.title,
      sponsorName: activity.sponsorName,
      startDate: activity.startDate,
      endDate: activity.endDate,
      minPrice: activity.minPrice,
      maxPrice: activity.maxPrice,
      mainImageUrl: activity.mainImageUrl,
      saleStartDate: activity.saleStartDate
    }));

    const recentActivities = activities.filter(activity => {
      const startDate = new Date(activity.startDate);
      return startDate >= currentDate && startDate <= oneMonthFromNow;
    }).map(activity => ({
      id: (activity as any)._id.toString(),
      title: activity.title,
      sponsorName: activity.sponsorName,
      startDate: activity.startDate,
      endDate: activity.endDate,
      minPrice: activity.minPrice,
      maxPrice: activity.maxPrice,
      mainImageUrl: activity.mainImageUrl
    }));

    const response = {
      hotActivities,
      upcomingActivities,
      recentActivities
    };

    handleSuccess(res, response);
  },
  async searchActivities(req: Request, res: Response, next: NextFunction): Promise<void> {
    const { subject, minPrice, maxPrice, startDate, endDate } = req.query;
    const query: any = {
      status: { $in: [ActivityStatus.Published, ActivityStatus.Ended, ActivityStatus.Discontinued] }
    };

    if (subject) {
      query.title = { $regex: subject, $options: 'i' };
    }

    if (minPrice) {
      query.minPrice = { $gte: Number(minPrice) };
    }

    if (maxPrice) {
      query.maxPrice = { $lte: Number(maxPrice) };
    }

    if (startDate) {
      query.startDate = { $gte: new Date(startDate.toString()) };
    }

    if (endDate) {
      query.endDate = { $lte: new Date(endDate.toString()) };
    }

    const activities: Activity[] = await ActivityModel.find(query).lean();

    handleSuccess(res, activities);
  },
  async getActivityById(req: Request, res: Response, next: NextFunction): Promise<void> {
    const { id } = req.params;
    const activity: Activity | null = await ActivityModel.findById(id).lean();
    const { _id, ...activityData } = activity as any;
    const response = {
      id: _id.toString(),
      ...activityData
    }
    handleSuccess(res, response);
  },
  async getScheduleInfoById(req: Request, res: Response, next: NextFunction): Promise<void> {
    const { scheduleId } = req.params;
    const activity = await ActivityModel.findOne({ schedules: { $elemMatch: { _id: scheduleId } } });

    if (!activity) {
      return appError(400, '查無此場次id', next);
    }

    const schedule = activity?.schedules.find((schedule) => schedule._id.toString() === scheduleId);

    const result = {
      activityId: activity._id,
      title: activity.title,
      sponsorName: activity.sponsorName,
      location: activity.location,
      address: activity.address,
      schedule: schedule,
    };

    handleSuccess(res, result);
  },
  async bookingActivity(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    const { id } = req.params;
    const {
      ticketList,
      buyer,
      cellPhone,
      email,
      address,
      memo
    } = req.body;

    if (!ticketList.length) {
      return next(appError(400, 'ticketList is invalid', next));
    }

    const activity = await ActivityModel.findById(id);
    if (!activity) {
      return next(appError(400, '活動不存在', next));
    }

    const userId = req.user.id;
    const orderNumber = generateOrderNumber();

    let totalAmount = 0;
    let ticketTotalCount = 0;
    const ticketCategories = activity.schedules.flatMap(schedule => schedule.ticketCategories);

    // 檢查是否有錯誤
    for (const ticket of ticketList) {
      const { id: ticketId } = ticket;

      // 根據 ticketList 中的 ID 查找對應的 ticketCategory
      const ticketCategory = ticketCategories.find(category => (category as any)._id.toString() === ticketId);

      if (!ticketCategory) {
        return next(appError(400, '票名不存在', next));
      }

      if (ticket.headCount > ticketCategory.remainingQuantity) {
        return next(appError(400, '票已售完', next));
      }
    }

    // 確定沒問題再建立model
    const newUserOrder = new UserOrderModel({
      buyer,
      cellPhone,
      email,
      address,
      memo,
      orderNumber,
      orderStatus: OrderStatus.PendingPayment,
      orderCreateDate: new Date(),
      ticketList: [],
      activityInfo: {
        title: activity.title,
        sponsorName: activity.sponsorName,
        location: activity.location,
        address: activity.address,
        startDate: activity.startDate,
        endDate: activity.endDate,
        mainImageUrl: activity.mainImageUrl,
        totalAmount: 0,
        ticketTotalCount: 0
      },
      activityId: activity._id,
      userId: userId
    });

    for (const ticket of ticketList) {
      const { id: ticketId, headCount } = ticket;

      // 根據 ticketList 中的 ID 查找對應的 ticketCategory
      const ticketCategory = ticketCategories.find(category => (category as any)._id.toString() === ticketId);

      // 創建新的 ticketList
      for (let i = 0; i < headCount; i++) {
        const orderNumber = newUserOrder.orderNumber;
        const newUserTicket: Ticket = {
          _id: new Types.ObjectId(),
          scheduleName: activity.schedules.find(schedule => schedule.scheduleName)?.scheduleName || '',
          categoryName: ticketCategory!.categoryName,
          price: ticketCategory!.price,
          ticketNumber: `${orderNumber}_${newUserOrder.ticketList.length + 1}`,
          ticketStatus: TicketStatus.PendingPayment,
          qrCode: await generateQRCode("ticketNumber"),
        };

        newUserOrder.ticketList.push(newUserTicket);

        totalAmount += ticketCategory!.price;
        ticketTotalCount += 1;
      }

      // 減少票的剩餘數量
      ticketCategory!.remainingQuantity -= headCount;
    }
    const orderId = newUserOrder._id;
    newUserOrder.activityInfo.totalAmount = totalAmount; // 新增總金額
    newUserOrder.activityInfo.ticketTotalCount = ticketTotalCount; // 新增總票數
    // 保存 UserOrder 和更新活動
    await newUserOrder.save();
    await activity.save();
    const result = {
      orderId: orderId.toString(),
    }

    handleSuccess(res, result);
  },
  async getNewebPayInfo(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    const { id } = req.params;
    const userOrderInfo: UserOrder | null = await UserOrderModel.findById(id).lean();
    const now = new Date();
    const TimeStamp = now.getTime();
    let aesEncrypt;
    let shaEncrypt;

    if(userOrderInfo) {
      // 藍新金流資訊
      const TradeInfo = {
        TimeStamp,
        MerchantOrderNo: userOrderInfo.orderNumber,
        Amt: userOrderInfo.activityInfo.totalAmount,
        ItemDesc: userOrderInfo.activityInfo.title,
        Email: userOrderInfo.email
      }
      aesEncrypt = createMpgAesEncrypt(TradeInfo, id)
      shaEncrypt = createMpgShaEncrypt(aesEncrypt)
    }
    const ticketListWithId = userOrderInfo?.ticketList.map(({ _id, ...ticket }) => ({ id: _id, ...ticket }));

    const json = {
      order: {
        orderNumber: userOrderInfo?.orderNumber,
        buyer: userOrderInfo?.buyer,
        cellPhone: userOrderInfo?.cellPhone,
        email: userOrderInfo?.email,
        address: userOrderInfo?.address,
        memo: userOrderInfo?.memo,
        activityInfo: {
          title: userOrderInfo?.activityInfo.title,
          sponsorName: userOrderInfo?.activityInfo.sponsorName,
          location: userOrderInfo?.activityInfo.location,
          address: userOrderInfo?.activityInfo.address,
        },
        ticketList: ticketListWithId
      },
      TimeStamp, // Unix 格式
			MerchantID: process.env.MerchantID,
			Version: process.env.Version,
      aesEncrypt,
      shaEncrypt
    }

    handleSuccess(res, json);
  }

}

export default activity;
