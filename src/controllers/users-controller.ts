import { Request, Response } from 'express'

export class UsersController {
  async index(_req: Request, res: Response) {
    return res.json()
  }

  async show(req: Request, res: Response) {
    return res.json()
  }

  async create(req: Request, res: Response) {
    return res.status(201).json()
  }
}
