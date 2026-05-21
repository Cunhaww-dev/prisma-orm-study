import { Request, Response } from 'express';
import { prisma } from '@/prisma';

export class UsersController {
  async index(_req: Request, res: Response) {
    const users = await prisma.user.findMany();

    return res.json(users);
  }

  async show(req: Request<{ id: string }>, res: Response) {
    const { id } = req.params;

    const user = await prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    return res.json(user);
  }

  async create(req: Request, res: Response) {
    const { name, email } = req.body;

    await prisma.user.create({
      data: {
        name,
        email,
      },
    });

    return res.status(201).json();
  }
}
