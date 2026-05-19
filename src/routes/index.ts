import { Router } from 'express'
import { usersRoutes } from './users-routes'
import { questionsRoutes } from './questions-routes'

export const router = Router()

router.use('/users', usersRoutes)
router.use('/questions', questionsRoutes)
