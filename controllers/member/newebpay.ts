import { Request, Response, NextFunction } from 'express';
import appError from '../../service/appError';
import handleSuccess from '../../service/handleSuccess';
import { createMpgShaEncrypt, createMpgAesDecrypt } from '../../service/crypto';
import { TicketStatus, UserOrderModel } from '../../models/userOrderModel';
import { transporter, mailOptions } from '../../service/email';
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
    const { MerchantOrderNo, PayTime, TradeNo, PaymentType, EscrowBank } = data.Result
    const inputFormat = 'YYYY-MM-DDTHH:mm:ss';
    const outputFormat = 'YYYY-MM-DDTHH:mm:ss.SSSZ';
    // 將日期字串轉換為指定格式的日期物件
    const dateObj = dayjs(PayTime, inputFormat);
    // 將日期物件轉換為指定格式的字串
    const newPayTime = dateObj.format(outputFormat);
    const orderData: any = await UserOrderModel.findOne(
      { orderNumber: MerchantOrderNo }
    ).populate({
      path: 'userId',
      select: 'email'
    })

    if(!orderData) {
      return appError(500, '查無此訂單', next);
    }
    if(response.Status === 'SUCCESS') {
      await UserOrderModel.updateOne({
          orderNumber: MerchantOrderNo
        }, {
          $set: {
            orderStatus: TicketStatus.ReadyToUse,
            'ticketList.$[].ticketStatus': TicketStatus.ReadyToUse,
            payTime: newPayTime, // 付款時間
            tradeNo: TradeNo, // 藍新金流交易序號
            paymentType: PaymentType, // 交易類型
            escrowBank: EscrowBank // 付款銀行
          },
        }
      );
        
      // 付款完成後寄信
      const userEmail = orderData?.userId?.email;
      const email_activityDate = dayjs(orderData.activityInfo.startDate).format('YYYY-MM-DD HH:mm:ss');
      const email_payTime = dayjs(PayTime).format('YYYY-MM-DD HH:mm:ss');
      const email_title = 'Musitix 活動付款完成通知';
      const email_content = `
        <html>
          <head>
            <style>
              ul {
                padding-left: 0px;
                list-style: none;
              }
              li {
                border: 1px solid #e3e3e3;
                width: 50%;
                padding: 8px;
              }
              .lh {
                line-height: 26px;
              }
            </style>
          </head>
          <body>
            <p>親愛的 musitix 會員您好</p>
            <p>
              感謝您購買 Musitix 音樂活動的門票並使用我們的金流服務進行付款。
              我們很高興通知您，您的付款已成功完成，並確保您獲得了以下的活動票券資訊：
            </p>
            <br>
            <p>活動名稱：${orderData.activityInfo.title}</p>
            <p>活動名稱：${email_activityDate}</p>
            <p>活動地址：${orderData.activityInfo.address}</p>
            <p>活動地點：${orderData.activityInfo.location}</p>
            <p>票券金額：${orderData.activityInfo.totalAmount}</p>
            <p>票券數量：${orderData.activityInfo.ticketTotalCount}</p>
            <p>交易序號：${TradeNo}</p>
            <p>付款方式：${PaymentType}</p>
            <p>付款日期：${email_payTime}</p>
            <br>
            <p>
              您的訂單編號是：${MerchantOrderNo}，請記得保留這個編號作為未來的參考。
            </p>
            <p>
              活動當天，我們將使用 QR Code 作為入場方式，請確保您在入場時攜帶您的手機或列印出 QR Code。您可以在進場時將 QR Code 出示給工作人員進行掃描。
            </p>
            <br>
            <p>
              如果您有任何疑問、變更需求或需要進一步的協助，請隨時聯繫我們的客戶服務團隊。我們將竭誠為您提供協助。
            </p>
            <p>
              Musitix 主辦方
              聯絡方式：06-1234567
              官方網站：${process.env.ClientBackURL}
            </p>
            <br>
            <P>
              此信箱為練習用，無商業用途。
            </p>
          </body>
        <html>
      `;
      
      // 建立 email 內容
      const options = mailOptions(userEmail, email_title, email_content);
      // email 寄信
      transporter.sendMail(options, (error) => {
        if (error) {
          return appError(500, '信箱送出失敗', next);
        }
      });
      handleSuccess(res, `付款完成，訂單：${ MerchantOrderNo }`);
    } else {
      await UserOrderModel.updateOne({
          orderNumber: MerchantOrderNo
        }, {
          $set: {
            orderStatus: TicketStatus.Failed,
            'ticketList.$[].ticketStatus': TicketStatus.Failed,
            payTime: newPayTime
          },
        }
      );
      handleSuccess(res, `付款失敗，訂單：${ MerchantOrderNo }`);
    }
  }
}

export default newebpay;
