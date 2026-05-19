import express, { NextFunction, Request, Response } from 'express'
import { router } from './routes/index'

const app = express()

app.use(express.json())
app.use(router)

app.use((error: Error, _req: Request, res: Response, _next: NextFunction) => {
  console.error(error)
  res.status(500).json({ message: 'Internal server error' })
})

app.listen(3333, () => console.log('Server is running on port 3333'))
