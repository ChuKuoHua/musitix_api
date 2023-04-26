import { NextFunction, Request, Response } from 'express';
function handleErrorAsync(func: (req: any, res: Response, next: NextFunction) => Promise<unknown>) {
  // func 先將 async fun 帶入參數儲存
  // middleware 先接住 router 資料
  return function (req: Request, res: Response, next: NextFunction) {
    //再執行函式，async 可再用 catch 統一捕捉
    func(req, res, next).catch(
      function (error: Error) {
        return next(error);
      }
    );
  };
}

export default handleErrorAsync