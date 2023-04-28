import { Response } from 'express';
function handleSuccess<T>(res: Response, data: T | T[]) {
  res.status(200).send({
    "status": "success",
    data
  });
}

export default handleSuccess