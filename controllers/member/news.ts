import { Request, Response, NextFunction } from 'express';
import handleSuccess from '../../service/handleSuccess';
import LatestNews from '../../models/latestnewsModel';

const latestNew = {
  // GET 最新消息
  async getLatestNews(req: Request, res: Response, next: NextFunction) {
    const latestNews = await LatestNews.find().lean();
    const Result = latestNews.map(latestNews => ({
      id: latestNews._id,
      title: latestNews.title,
      date: latestNews.updatedAt,
      content: latestNews.content,
    }));
    handleSuccess(res, Result);
  }
}

export default latestNew;
