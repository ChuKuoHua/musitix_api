import { Request, Response, NextFunction } from 'express';

import ActivityModel, { Activity } from '../../models/activityModel';
import handleSuccess from '../../service/handleSuccess';

const activity = {
  async getPublishedActivities(req: Request, res: Response, next: NextFunction): Promise<void> {
    const activities: Activity[] = await ActivityModel.find().lean();

    const hotActivities = activities.map(activity => ({
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
    });

    const recentActivities = activities.filter(activity => {
      const startDate = new Date(activity.startDate);
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      return startDate <= sevenDaysAgo;
    });

    const response = {
      hotActivities,
      upcomingActivities,
      recentActivities
    };
    handleSuccess(res, response)
  },
  async searchActivities(req: Request, res: Response, next: NextFunction): Promise<void> {
    const { subject, minPrice, maxPrice, startDate, endDate } = req.query;
    const query: any = {};

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
      query.startDate = { $gte: new Date(startDate.toString())};
    }

    if (endDate) {
      query.endDate = { $lte: new Date(endDate.toString())};
    }

    const activities: Activity[] = await ActivityModel.find(query).lean();

    handleSuccess(res, activities);
  },
  async getActivityById(req: Request, res: Response, next: NextFunction): Promise<void> {
    const { id } = req.params;
    const activity: Activity | null = await ActivityModel.findById(id).lean();
    handleSuccess(res, activity);
  },
  async bookingActivity(req: Request, res: Response, next: NextFunction): Promise<void> {
    //this need post method for bookingActivity
    const { id } = req.params;
    const { ticketCategories } = req.body;


  }
}

export default activity;
