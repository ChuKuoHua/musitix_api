import { Request, Response, NextFunction } from 'express';
import handleSuccess from '../../service/handleSuccess';
import BannerModel from '../../models/bannerModel';


const banner = {
  // 新增問題
  async getBanner(req: Request, res: Response, next: NextFunction) {
    const banner = await BannerModel.find().lean();
    handleSuccess(res, banner);
  },
}

export default banner;
