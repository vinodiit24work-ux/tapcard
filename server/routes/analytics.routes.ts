import { Router } from 'express'
import { handler } from '../utils/http'
import { requireAuth } from '../middleware/auth'
import { ownedCard } from '../services/card.service'
import { summarise } from '../services/analytics.service'

export const analyticsRouter = Router()
analyticsRouter.use(requireAuth)

analyticsRouter.get(
  '/summary',
  handler(async (req, res) => {
    const card = await ownedCard(req.auth!.sub)
    const range = ['1', '7', '30', '90'].includes(String(req.query.range)) ? String(req.query.range) : '30'
    res.json(await summarise(card.id, range))
  }),
)
