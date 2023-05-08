import ActivityModel, { Activity, ActivityStatus } from '../models/activityModel';

export default class ActivityService {
  public getAllActivities(): Promise<Activity[]> {
    return ActivityModel.find().exec();
  }

  public getActivityById(id: string): Promise<Activity | null> {
    return ActivityModel.findById(id).exec();
  }

}