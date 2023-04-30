import { Response } from 'express';
function handleSuccess<T>(res: Response, data: T | T[], httpStatus: number | void) {
  const status = httpStatus ? httpStatus : 200
  res.status(status).send({
    message: "成功",
    data
  });
}

export default handleSuccess