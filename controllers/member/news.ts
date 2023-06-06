import { Request, Response, NextFunction } from 'express';
import handleSuccess from '../../service/handleSuccess';
import LatestNews from '../../models/latestnewsModel';

const latestNews = {
  // GET 最新消息
  async getLatestNews(req: Request, res: Response, next: NextFunction) {
    const latestNews = await LatestNews.find().lean();
    handleSuccess(res, latestNews);
  }
}

export default latestNews;
