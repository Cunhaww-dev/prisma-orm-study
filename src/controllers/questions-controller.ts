import { Request, Response } from 'express';

export class QuestionsController {
  async index(_req: Request, res: Response) {
    return res.json();
  }

  async create(req: Request, res: Response) {
    return res.status(201).json();
  }

  async update(req: Request, res: Response) {
    return res.json();
  }

  async remove(req: Request, res: Response) {
    return res.status(204).send();
  }
}
