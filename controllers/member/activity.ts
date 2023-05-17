import { Request, Response, NextFunction } from 'express';

import ActivityModel, { Activity, ActivityStatus } from '../../models/activityModel';
import handleSuccess from '../../service/handleSuccess';
import appError from '../../service/appError';

const activity = {
  async getPublishedActivities(req: Request, res: Response, next: NextFunction): Promise<void> {
    const activities: Activity[] = await ActivityModel.find().lean();

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
      const sevenDaysFromNow = new Date();
      sevenDaysFromNow.setDate(sevenDaysFromNow.getDate() + 7);
      return saleStartDate <= sevenDaysFromNow;
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
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      return startDate <= sevenDaysAgo;
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
    handleSuccess(res, activity);
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
  async bookingActivity(req: Request, res: Response, next: NextFunction): Promise<void> {


  }
}

export default activity;
