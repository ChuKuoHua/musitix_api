import { Request, Response, NextFunction } from 'express';

import ActivityModel, { Activity, ActivityStatus, CreateActivityCommand } from '../../models/activityModel';
import handleSuccess from '../../service/handleSuccess';
import appError from '../../service/appError';

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
      const { title, sponsorName, location, startDate, endDate, mainImageUrl,
        HtmlContent, HtmlNotice, schedules, saleStartDate, saleEndDate } = req.body;

      const status: ActivityStatus = ActivityStatus.Unpublished;
      const activity: Activity = {
        title, sponsorName, location, startDate, endDate, mainImageUrl,
        HtmlContent, HtmlNotice, schedules, saleStartDate, saleEndDate,
        status
      }

      const newActivity = await ActivityModel.findByIdAndUpdate(_id, activity, { new: true });
      handleSuccess(res, newActivity);
    }
  }
}

export default activityManage;
