import { Request, Response, NextFunction } from 'express';
const notFound = (req: Request, res: Response, next: NextFunction) => {
  res.status(404).send({
    "status": "false",
    "message": '無此路由'
  });
}

export default notFound