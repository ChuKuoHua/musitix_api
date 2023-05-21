import { Request, Response, NextFunction } from 'express';
import handleSuccess from '../../service/handleSuccess';
import QuestionModel, { Question } from '../../models/questionModel';


const question = {
  // 新增問題
  async post(req: Request, res: Response, next: NextFunction) {
    const { name, email, type, subject, content } = req.body;

    const question: Partial<Question> = {
      name,
      email,
      type,
      subject,
      content
    }
    const newQuestion = await QuestionModel.create(question);
    handleSuccess(res, '成功');
  }
}

export default question;
