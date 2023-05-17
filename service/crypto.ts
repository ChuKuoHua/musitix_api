import crypto from 'crypto';

const { HASHKEY, HASHIV, MerchantID, Version, RespondType }: any = process.env;

// 字串組合
function genDataChain(order: any) {
  return `MerchantID=${MerchantID}&RespondType=${RespondType}&TimeStamp=${
    order.TimeStamp
  }&Version=${Version}&MerchantOrderNo=${order.MerchantOrderNo}&Amt=${
    order.Amt
  }&ItemDesc=${encodeURIComponent(order.ItemDesc)}&Email=${encodeURIComponent(
    order.Email,
  )}`;
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