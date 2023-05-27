import qrcode from 'qrcode';

export function generateOrderNumber(): string {
    const timestamp = new Date().getTime(); //取得時間
    const randomSuffix = Math.floor(Math.random() * 10000).toString().padStart(4, '0'); //產生 4 位數的隨機數字
    const orderNumber = `FEST2023_${timestamp}_${randomSuffix}`; //組合訂單編號
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