import { Response } from 'express';
function handleSuccess(res: Response, data: string[]) {
  res.status(200).send({
    "status": "success",
    data
  });
}

module.exports = handleSuccess