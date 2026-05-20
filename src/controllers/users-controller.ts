import { Request, Response } from 'express';
import { prisma } from '@/prisma';

export class UsersController {
  async index(_req: Request, res: Response) {
    return res.json();
  }

  async show(req: Request, res: Response) {
    return res.json();
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
