import { Request, Response, NextFunction } from 'express';

import ActivityModel, { Activity, ActivityStatus, CreateActivityCommand } from '../../models/activityModel';
import handleSuccess from '../../service/handleSuccess';

const activityManage = {
  async createActivity(req: Request<any, any, CreateActivityCommand>, res: Response, next: NextFunction) {
    if (req.body) {
      const { title, sponsorName, location, startDate, endDate, mainImageUrl,
        HtmlContent, HtmlNotice, schedules, saleStartDate, saleEndDate } = req.body;
      const status: ActivityStatus = ActivityStatus.Unpublished;
      const activity: Activity = {
        title, sponsorName, location, startDate, endDate, mainImageUrl,
        HtmlContent, HtmlNotice, schedules, saleStartDate, saleEndDate,
        status
      }
      const newActivity = await ActivityModel.create(activity);
      handleSuccess(res, newActivity);
    }
  }
}

export default activityManage;
