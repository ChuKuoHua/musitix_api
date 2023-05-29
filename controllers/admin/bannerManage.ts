import { Request, Response, NextFunction } from 'express';
import appError from '../../service/appError';
import handleSuccess from '../../service/handleSuccess';
import BannerModel from '../../models/bannerModel';
import ActivityModel from '../../models/activityModel';
import mongoose from 'mongoose';

const bannerManage = {
  // NOTE banner table
  async bannerList(req: Request, res: Response, next: NextFunction) {
    const bannerList = await BannerModel.find().lean();
    handleSuccess(res, bannerList);
  },
  // NOTE 所有活動圖片
  async activityAllImage(req: Request, res: Response, next: NextFunction) {
    const activitys = await ActivityModel.find({},
      'id title mainImageUrl').lean();
    handleSuccess(res, activitys);
  },
  // NOTE 新增
  async addBanner(req: Request, res: Response, next: NextFunction) {
    const { activityId, image } = req.body; 
    let errorMsg: string[] = [];

    if (!activityId) {
      errorMsg.push('活動 ID 不得為空');
    }
    if (!image) {
      errorMsg.push('請選擇圖片');
    }
    if(errorMsg.length > 0) {
      return appError(400, errorMsg, next);
    }

    const actData = await ActivityModel.findById({
      _id: new mongoose.Types.ObjectId(activityId)
    });
    if(!actData) {
      return appError(400, '查無活動 ID', next);
    }
    const data = await BannerModel.findOne({ image: image });
    if (data) {
      return appError(400, '圖片已存在', next);
    }
    try {
      await BannerModel.create({
        activity_id: activityId,
        activity_title: actData.title,
        image
      });
      handleSuccess(res, '新增成功');
    } catch (error) {
      return appError(500, '新增失敗', next);
    }
  },
  // NOTE 刪除
  async deleteBanner(req: Request, res: Response, next: NextFunction) {
    const { id } = req.params;
    // 檢查有無此會員
    const bannerCheck = await BannerModel.findById(id)
    if (!bannerCheck) {
      return appError(400,"查無此 id",next);
    }

    const data = await BannerModel.deleteOne({ '_id': id })
    if (data) {
      handleSuccess(res, '已刪除');
    }
  }
}

export default bannerManage;