import { Request, Response, NextFunction } from 'express';
import { searchRequest } from '../../models/other';
import appError from '../../service/appError';
import handleSuccess from '../../service/handleSuccess';
import User from '../../models/users';

const memberManage = {
  // NOTE 會員資料
  async usersList(req: searchRequest, res: Response, next: NextFunction) {
    // asc 遞增(由小到大，由舊到新) createdAt ; 
    // desc 遞減(由大到小、由新到舊) "-createdAt"
    const timeSort = req.query.timeSort === "asc" ? "createdAt" : "-createdAt"
    const q = req.query.search !== undefined ? new RegExp(req.query.search)
    : '';
    // 用來判斷作廢或未作廢資料
    const disabled = req.query.disabled ? req.query.disabled : false
    const page: number = req.query.page ? Number(req.query.page) : 1
    const limit: number = req.query.limit ? Number(req.query.limit) : 25

    const data = await User.find({
      // 模糊搜尋多欄位
      $or: [
        { id: { $regex: q } },
        { username: { $regex: q } },
        { email: { $regex: q } },
      ],
      role: "user",
      isDisabled: disabled
    })
    .sort(timeSort)
    .skip((page - 1) * limit)
    .limit(limit)

    // 取得總數量
    const count = await User.countDocuments({
      $or: [
        { id: { $regex: q } },
        { username: { $regex: q } },
        { email: { $regex: q } },
      ],
      role: "user",
      isDisabled: disabled
    });

    // 計算總頁數
    const totalPages = Math.ceil(count / limit);

    const json = {
      totalCount: count, // 總數量
      totalPages: totalPages, // 總頁數
      currentPage: page, // 目前頁數
      limit: limit, // 顯示數量
      users: data, // 會員資料
    }

    handleSuccess(res, json);
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
  // 刪除會員(後端用)
  async deleteUser(req: Request, res: Response, next: NextFunction) {
    let { userId, isDisabled } = req.body;

    // 檢查有無此會員
    const userCheck = await User.findOne({
      "_id": userId
    })

    if(!userCheck) {
      return next(appError(400,"查無此 id",next));
    }
    
    const data = await User.deleteOne({"_id": userId})
    if(data) {
      handleSuccess(res, '此會員已停用')
    }
  },
}

export default memberManage;