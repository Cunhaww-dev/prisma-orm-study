import { Request, Response } from 'express'

export class UsersController {
  index = async (_req: Request, res: Response) => {
    return res.json([])
  }

  show = async (req: Request, res: Response) => {
    const { id } = req.params
    return res.json({ id })
  }

  create = async (req: Request, res: Response) => {
    const body = req.body
    return res.status(201).json(body)
  }
}
