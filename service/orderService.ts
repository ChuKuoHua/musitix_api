import qrcode from 'qrcode';

export function generateRandomString(length: number): string {
  let result = '';
  const characters = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ"; // 包含數字和大小寫字母的字符集

  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * characters.length);
    const randomChar = characters[randomIndex];
    result += randomChar;
  }

  return result;
}

export function generateOrderNumber(): string {
    const timestamp = new Date().getTime() - 1672502400000; //取得時間 (從2023/01/01 +08:00)
    const randomSuffix = generateRandomString(4); //產生 4 位數的隨機數字
    const orderNumber = `${timestamp}_${randomSuffix}`; //組合訂單編號
    return orderNumber;
}

// QRcode
export async function generateQRCode(text: string): Promise<string> {
    try {
      const qrCode = await qrcode.toDataURL(text);
      return qrCode;
    } catch (error) {
      throw new Error('Failed to generate QR code');
    }
}
