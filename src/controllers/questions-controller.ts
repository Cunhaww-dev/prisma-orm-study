import { Request, Response } from 'express';
import { prisma } from '@/prisma';

export class QuestionsController {
  async index(req: Request, res: Response) {
    const questions = await prisma.question.findMany({
      where: {
        title: {
          contains: req.query.title?.toString().trim(),
          mode: 'insensitive',
        },
      },
      orderBy: {
        title: 'asc',
      },
    });

    return res.json(questions);
  }

  async create(req: Request, res: Response) {
    const { title, content, user_id } = req.body;

    await prisma.question.create({
      data: {
        title,
        content,
        userId: user_id,
      },
    });

    return res.status(201).json();
  }

  async update(req: Request, res: Response) {
    const { id } = req.params as { id: string };
    const { title, content } = req.body;

    await prisma.question.update({
      data: {
        title,
        content,
      },
      where: {
        id,
      },
    });

    return res.json();
  }

  async remove(req: Request, res: Response) {
    const { id } = req.params as { id: string };

    await prisma.question.delete({
      where: {
        id,
      },
    });
    return res.status(204).send();
  }
}
