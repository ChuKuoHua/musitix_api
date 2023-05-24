import crypto from 'crypto';
const NotifyURL = `${process.env.BACKEND_BASE_URL}/api/activities/spgateway_notify`;
const {
  HASHKEY,
  HASHIV,
  MerchantID,
  Version,
  RespondType,
  ClientBackURL }: any = process.env;

// 字串組合
function genDataChain(order: any) {
  // 付款期限
  // 如果沒給，藍新預設為 7 天
  const ExpireDate = order?.ExpireDate

  return `MerchantID=${MerchantID}` // 商店代號
    + `&RespondType=${RespondType}` // 回傳格式
    + `&TimeStamp=${order.TimeStamp}` // 時間戳 Unix 格式
    + `&Version=${Version}` // 版本
    + `&MerchantOrderNo=${order.MerchantOrderNo}` // 訂單編號
    + `&Amt=${order.Amt}` // 金額 
    + `&ItemDesc=${encodeURIComponent(order.ItemDesc)}` // 商品資訊 
    + `&Email=${encodeURIComponent(order.Email)}` // 會員信箱
    + `&NotifyURL=${NotifyURL}` // 處理付款回傳結果
    // + `&ReturnURL=${ReturnURL}` // 支付完成返回商店網址
    + `&ClientBackURL=${ClientBackURL}` // 支付取消返回商店網址
    + `&ExpireDate=${ExpireDate ? ExpireDate : ''}`; // 付款期限
}

// 此加密主要是提供交易內容給予藍新金流
function createMpgAesEncrypt(TradeInfo: any) {
  const encrypt = crypto.createCipheriv('aes256', HASHKEY, HASHIV);
  const enc = encrypt.update(genDataChain(TradeInfo), 'utf8', 'hex');
  return enc + encrypt.final('hex');
}

// 對應文件 P17：使用 sha256 加密
// 使用 HASH 再次 SHA 加密字串，作為驗證使用
// $hashs="HashKey=".$key."&".$edata1."&HashIV=".$iv;
function createMpgShaEncrypt(aesEncrypt: string) {
  const sha = crypto.createHash('sha256');
  const plainText = `HashKey=${HASHKEY}&${aesEncrypt}&HashIV=${HASHIV}`;

  return sha.update(plainText).digest('hex').toUpperCase();
}

// 將 aes 解密
function createMpgAesDecrypt(TradeInfo: string) {
  const decrypt = crypto.createDecipheriv('aes256', HASHKEY, HASHIV);
  decrypt.setAutoPadding(false);
  const text = decrypt.update(TradeInfo, 'hex', 'utf8');
  const plainText = text + decrypt.final('utf8');
  const result = plainText.replace(/[\x00-\x20]+/g, '');
  return JSON.parse(result);
}

export {
  createMpgAesEncrypt,
  createMpgShaEncrypt,
  createMpgAesDecrypt
}