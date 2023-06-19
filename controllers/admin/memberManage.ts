import { Request, Response, NextFunction } from 'express';
import { searchRequest } from '../../models/otherModel';
import appError from '../../service/appError';
import handleSuccess from '../../service/handleSuccess';
import User from '../../models/usersModel';
import { UserOrderModel } from '../../models/userOrderModel';

const memberManage = {
  // NOTE 會員資料
  async usersList(req: searchRequest, res: Response, next: NextFunction) {
    const { timeSort, search, disabled, page, limit} = req.query;
    // asc 遞增(由小到大，由舊到新) createdAt ; 
    // desc 遞減(由大到小、由新到舊) "-createdAt"
    const sortAt = timeSort === "asc" ? "createdAt" : "-createdAt"
    const q = search !== undefined ? new RegExp(search)
    : '';
    // 用來判斷作廢或未作廢資料
    const isDisabled = disabled ? disabled : false
    const pageNum: number = page ? Number(page) : 1
    const limitNum: number = limit ? Number(limit) : 25

    const data = await User.find({
      // 模糊搜尋多欄位
      $or: [
        { id: { $regex: q } },
        { username: { $regex: q } },
        { email: { $regex: q } },
      ],
      role: "user",
      isDisabled: isDisabled
    }).sort(sortAt)
    .skip((pageNum - 1) * limitNum)
    .limit(limitNum).lean();
    
    // 取得總數量
    const count = await User.countDocuments({
      $or: [
        { id: { $regex: q } },
        { username: { $regex: q } },
        { email: { $regex: q } }
      ],
      role: "user",
      isDisabled: isDisabled
    });
    // 計算總頁數
    const totalPages = Math.ceil(count / limitNum);
    const json = {
      totalCount: count, // 總數量
      totalPages: totalPages, // 總頁數
      currentPage: pageNum, // 目前頁數
      limit: limitNum, // 顯示數量
      users: data, // 會員資料
    }

    handleSuccess(res, json);
  },
  // NOTE 會員停用/啟用
  async invalidUser(req: Request, res: Response, next: NextFunction) {
    const { userId, isDisabled } = req.body;
    // 檢查有無此會員
    const userCheck = await User.findOne({ "_id": userId });
    if(!userCheck) {
      return appError(400,"查無此 id",next);
    }
    await User.findByIdAndUpdate(userId, {
      $set: { isDisabled: isDisabled }
    });
    if (isDisabled) {
      handleSuccess(res, '此會員已停用');
    } else {
      handleSuccess(res, '此會員已啟用');
    }
  },
  // 刪除會員(後端用)
  async deleteUser(req: Request, res: Response, next: NextFunction) {
    let { userId } = req.body;

    // 檢查有無此會員
    const userCheck = await User.findOne({ "_id": userId });
    if(!userCheck) {
      return appError(400,"查無此 id",next)
    }

    const data = await User.deleteOne({ "_id": userId });
    if(data) {
      handleSuccess(res, '此會員已停用')
    }
  },
  // 購票紀錄
  async ticketRecord(req: Request, res: Response, next: NextFunction) {
    const userId = req.params.id;
    const { page, limit } = req.query;
    const pageNum: number = page ? Number(page) : 1;
    const limitNum: number = limit ? Number(limit) : 25;
    const data: any = await UserOrderModel.find({
      userId: userId
    }, 'buyer activityId cellPhone orderNumber orderStatus orderCreateDate memo ticketList.scheduleName ticketList.categoryName ticketList.price ticketList.ticketNumber ticketList.ticketStatus activityInfo.title activityInfo.totalAmount activityInfo.ticketTotalCount email address'
    ).skip((pageNum - 1) * limitNum)
    .limit(limitNum).lean();

    // 取得總數量
    const count = await UserOrderModel.countDocuments({ userId: userId });
    // 計算總頁數
    const totalPages = Math.ceil(count / limitNum);
    const json = {
      totalCount: count, // 總數量
      totalPages: totalPages, // 總頁數
      currentPage: pageNum, // 目前頁數
      limit: limitNum, // 顯示數量
      orders: data, // 購票資料
    }

    handleSuccess(res, json);
  }
}

export default memberManage;