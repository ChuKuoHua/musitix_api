import { Request, Response, NextFunction } from 'express';
import { searchRequest } from "../../models/other";
import appError from '../../service/appError';
import handleSuccess from '../../service/handleSuccess';
import User from '../../models/users';

const memberManage = {
  // NOTE 會員資料
  async usersList(req: searchRequest, res: Response, next: NextFunction) {
    // asc 遞增(由小到大，由舊到新) createdAt ; 
    // desc 遞減(由大到小、由新到舊) "-createdAt"
    const timeSort = req.query.timeSort === "asc" ? "createdAt" : "-createdAt"
    
    const q = req.query.q !== undefined ? new RegExp(req.query.q)
    : '';

    // // 模糊搜尋多欄位
    const data = await User.find({
      $or: [
        { id: {$regex: q } },
        { username: { $regex: q } },
        { email: { $regex: q } }
      ],
      role: "user"
    }).sort(timeSort)
    
    handleSuccess(res, data);
  },
  // NOTE 會員停用/啟用
  async invalidUser(req: Request, res: Response, next: NextFunction) {
    let { userId, isDisabled } = req.body;

    // 檢查有無此會員
    const userCheck = await User.findOne({
      "_id": userId
    })

    if(!userCheck) {
      return next(appError(400,"查無此 id",next));
    }
    
    await User.findByIdAndUpdate(userId, {
      $set: {
        isDisabled: isDisabled
      }
    })

    if(isDisabled) {
      handleSuccess(res, '此會員已停用')
    } else {
      handleSuccess(res, '此會員已啟用')
    }
  },
}

export default memberManage;