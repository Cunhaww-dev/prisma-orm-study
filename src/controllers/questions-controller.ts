import { Request, Response } from 'express'

export class QuestionsController {
  index = async (_req: Request, res: Response) => {
    return res.json([])
  }

  create = async (req: Request, res: Response) => {
    const body = req.body
    return res.status(201).json(body)
  }

  update = async (req: Request, res: Response) => {
    const { id } = req.params
    const body = req.body
    return res.json({ id, ...body })
  }

  remove = async (req: Request, res: Response) => {
    const { id } = req.params
    return res.status(204).send()
  }
}
