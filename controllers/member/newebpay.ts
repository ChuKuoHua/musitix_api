import { Request, Response, NextFunction } from 'express';
import appError from '../../service/appError';
import handleSuccess from '../../service/handleSuccess';
import { createMpgShaEncrypt, createMpgAesDecrypt } from '../../service/crypto';
import { TicketStatus, UserOrderModel } from '../../models/userOrderModel';
import dayjs from 'dayjs';

const newebpay = {
  // NOTE 交易成功導回頁面
  // async newebpayReturn(req: Request, res: Response, next: NextFunction) {
  //   const response = req.body;
  //   const data = createMpgAesDecrypt(response.TradeInfo);
    
  //   if(response.Status === 'SUCCESS') {
  //     res.redirect('https://musitix-south3.onrender.com/#/');
  //   } else {
  //     res.redirect('https://musitix-south3.onrender.com/#/');
  //   }
  // },
  // 回傳狀態後，修改訂單狀態
  async newebpayNotify(req: Request, res: Response, next: NextFunction) {
    const response = req.body;
    const thisShaEncrypt = createMpgShaEncrypt(response.TradeInfo);
    // 使用 HASH 再次 SHA 加密字串，確保比對一致（確保不正確的請求觸發交易成功）
    if (!thisShaEncrypt === response.TradeSha) {
      return appError(500, '付款失敗：TradeSha 不一致', next);
    }
  
    // NOTE 確認交易：Notify
    const data = createMpgAesDecrypt(response.TradeInfo);

    // 取得交易內容，並查詢本地端資料庫是否有相符的訂單
    const orderId = data?.Result?.MerchantOrderNo;
    const payTime = data?.Result?.PayTime;
    const inputFormat = 'YYYY-MM-DDTHH:mm:ss';
    const outputFormat = 'YYYY-MM-DDTHH:mm:ss.SSSZ';
    // 將日期字串轉換為指定格式的日期物件
    const dateObj = dayjs(payTime, inputFormat);
    // 將日期物件轉換為指定格式的字串
    const newPayTime = dateObj.format(outputFormat);
    const orderData = await UserOrderModel.findOne(
      { orderNumber: orderId }
    )

    if(!orderData) {
      return appError(500, '查無此訂單', next);
    }
    if(response.Status === 'SUCCESS') {
      await UserOrderModel.updateOne({
          orderNumber: orderId
        }, {
          $set: {
            orderStatus: TicketStatus.ReadyToUse,
            'ticketList.$[].ticketStatus': TicketStatus.ReadyToUse,
            payTime: newPayTime
          },
        }
      );
      handleSuccess(res, `付款完成，訂單：${orderId}`);
    } else {
      await UserOrderModel.updateOne({
          orderNumber: orderId
        }, {
          $set: {
            orderStatus: TicketStatus.Failed,
            'ticketList.$[].ticketStatus': TicketStatus.Failed,
            payTime: newPayTime
          },
        }
      );
      handleSuccess(res, `付款失敗，訂單：${orderId}`);
    }
  },
}

export default newebpay;
