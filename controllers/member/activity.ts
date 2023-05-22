import { Request, Response, NextFunction } from 'express';

import ActivityModel, { Activity, ActivityStatus } from '../../models/activityModel';
import handleSuccess from '../../service/handleSuccess';
import appError from '../../service/appError';
import { TicketStatus, OrderStatus, Ticket, UserOrderModel } from '../../models/userOrderModel';
import { generateOrderNumber, generateQRCode } from '../../service/orderService';
import User from '../../models/usersModel';
import { AuthRequest } from '../../models/otherModel';
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
    const activity = await ActivityModel.findById(id);
    if (!activity) {
      return next(appError(400, '活動不存在', next));
    }

    // 找到符合條件的 UserOrder
    let userOrder = await UserOrderModel.findOne({ buyer, cellPhone, email, activityId: id});
    const userId = req.user.id;
    // 如果 UserOrder 不存在，則新增 UserOrder
    if (!userOrder) {
      const orderNumber = await generateOrderNumber();
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
        activityId: activity._id,
        userId: userId
      });
      await newUserOrder.save();

      // 更新 userOrder 變數
      userOrder = newUserOrder;
    }

    // 檢查同一個 UserOrder 中的票數量是否超過四張
    const existingTicketCount = userOrder.ticketList.reduce((count, ticket) => {
      if (
        ticket.ticketStatus === TicketStatus.ReadyToUse ||
        ticket.ticketStatus === TicketStatus.PendingPayment
      ) {
        return count + 1;
      }
      return count;
    }, 0);

    let totalHeadCount = 0;
    for (const ticket of ticketList) {
      totalHeadCount += ticket.headCount;
    }
    for (const ticket of ticketList) {
      const { id: ticketId, headCount } = ticket;

      // 根據 ticketList 中的 ID 查找對應的 ticketCategory
      const ticketCategory = activity.schedules
        .flatMap(schedule => schedule.ticketCategories)
        .find(category => (category as any)._id.toString() === ticketId);

      if (!ticketCategory) {
        return next(appError(400, '票名不存在', next));
      }

      // 減剩餘數量
      if (ticketCategory.remainingQuantity === 0) {
        return next(appError(400, '票已售完', next));
      }

      // 檢查票數量是否超過四張
      if (existingTicketCount + totalHeadCount > 4) {
        return next(appError(400, '每位用戶同一場活動最多只能訂購四張票', next));
      }

      // 創建新的 ticketList
      for (let i = 0; i < headCount; i++) {
        const orderNumber = userOrder.orderNumber;
        const newUserTicket: Ticket = {
          scheduleName: activity.schedules.find(schedule => schedule.scheduleName)?.scheduleName || '',
          categoryName: ticketCategory.categoryName,
          price: ticketCategory.price,
          ticketNumber: `${orderNumber}-${userOrder.ticketList.length + 1}`, // 流水號
          ticketStatus: TicketStatus.PendingPayment,
          qrCode: await generateQRCode("ticketNumber"), // 生成QRCode
        };

        userOrder.ticketList.push(newUserTicket);
      }

      // 減少票的剩餘數量
      ticketCategory.remainingQuantity -= headCount;
    }

    // 保存 UserOrder 和更新活動
    await userOrder.save();
    await activity.save();

    handleSuccess(res, "");
  }
}

export default activity;
