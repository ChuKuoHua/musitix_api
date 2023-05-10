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
  }
}

export default activity;
