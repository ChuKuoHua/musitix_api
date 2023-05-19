import { Request, Response, NextFunction } from 'express';
import appError from '../../service/appError';
import handleSuccess from '../../service/handleSuccess';
import { createMpgShaEncrypt, createMpgAesDecrypt } from '../../service/crypto';

const newebpay = {
  // NOTE 交易成功導回頁面
  async newebpayReturn(req: Request, res: Response, next: NextFunction) {
    const response = req.body;
    const data = createMpgAesDecrypt(response.TradeInfo);
    
    if(data.Status === 'SUCCESS') {
      res.redirect('https://musitix-south3.onrender.com/#/');
    } else {
      res.redirect('https://musitix-south3.onrender.com/#/');
    }
  },
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
    const orderId = data?.Result?.MerchantOrderNo
    // const orderData = await userOrders.findOne(
    //   {
    //     orderNumber: orderId
    //   },
    // )

    // if(!orderData) {
    //   return appError(500, '查無此訂單', next);
    // }

    // await userOrders.findByIdAndUpdate(orderId,
    //   {
    //     orderStatus: 1
    //   }
    // );
    // handleSuccess(res, `付款完成，訂單：${orderId}`);
  },
}

export default newebpay;
