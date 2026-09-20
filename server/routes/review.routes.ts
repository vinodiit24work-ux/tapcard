import { Router } from 'express'
import { prisma } from '../lib/prisma.js'
import { ApiError, handler } from '../utils/http.js'
import { validate } from '../middleware/validate.js'
import { requireAuth } from '../middleware/auth.js'
import { ownedCard } from '../services/card.service.js'
import { reviewStats } from '../services/review.service.js'
import { reorderSuggestionsSchema, reviewCopySchema, reviewListSchema, suggestionSchema } from '../validators/review.validators.js'

export const reviewRouter = Router()
reviewRouter.use(requireAuth)

/**
 * Every handler resolves the business from the authenticated user's own card.
 * A businessId is never taken from the request, so one account cannot reach another's data.
 */
const ownBusinessId = async (userId: string) => (await ownedCard(userId)).businessId

/* ------------------------------- suggestions ------------------------------ */

reviewRouter.get(
  '/suggestions',
  handler(async (req, res) => {
    const businessId = await ownBusinessId(req.auth!.sub)
    const suggestions = await prisma.suggestedReview.findMany({ where: { businessId }, orderBy: { position: 'asc' } })
    res.json({ suggestions })
  }),
)

reviewRouter.post(
  '/suggestions',
  validate(suggestionSchema),
  handler(async (req, res) => {
    const businessId = await ownBusinessId(req.auth!.sub)
    const count = await prisma.suggestedReview.count({ where: { businessId } })
    if (count >= 12) throw ApiError.badRequest('You can offer up to 12 suggestions. Delete one to add another.')
    const { text, enabled } = req.body as { text: string; enabled?: boolean }
    const suggestion = await prisma.suggestedReview.create({
      data: { businessId, text, enabled: enabled ?? true, position: count },
    })
    res.status(201).json({ suggestion })
  }),
)

reviewRouter.patch(
  '/suggestions/:id',
  validate(suggestionSchema.partial()),
  handler(async (req, res) => {
    const businessId = await ownBusinessId(req.auth!.sub)
    // Scoped by businessId as well as id, so guessing another business's uuid achieves nothing.
    const { count } = await prisma.suggestedReview.updateMany({
      where: { id: String(req.params.id), businessId },
      data: req.body as { text?: string; enabled?: boolean },
    })
    if (count === 0) throw ApiError.notFound('That suggestion does not exist.')
    const suggestion = await prisma.suggestedReview.findUnique({ where: { id: String(req.params.id) } })
    res.json({ suggestion })
  }),
)

reviewRouter.delete(
  '/suggestions/:id',
  handler(async (req, res) => {
    const businessId = await ownBusinessId(req.auth!.sub)
    const { count } = await prisma.suggestedReview.deleteMany({ where: { id: String(req.params.id), businessId } })
    if (count === 0) throw ApiError.notFound('That suggestion does not exist.')
    res.json({ ok: true })
  }),
)

reviewRouter.put(
  '/suggestions/order',
  validate(reorderSuggestionsSchema),
  handler(async (req, res) => {
    const businessId = await ownBusinessId(req.auth!.sub)
    const { ids } = req.body as { ids: string[] }
    await prisma.$transaction(
      ids.map((id, position) => prisma.suggestedReview.updateMany({ where: { id, businessId }, data: { position } })),
    )
    const suggestions = await prisma.suggestedReview.findMany({ where: { businessId }, orderBy: { position: 'asc' } })
    res.json({ suggestions })
  }),
)

/* ---------------------------------- copy ---------------------------------- */

reviewRouter.patch(
  '/copy',
  validate(reviewCopySchema),
  handler(async (req, res) => {
    const card = await ownedCard(req.auth!.sub)
    const updated = await prisma.digitalCard.update({
      where: { id: card.id },
      data: req.body as Record<string, string | boolean>,
      select: {
        reviewHeadline: true, reviewDescription: true, suggestionsTitle: true, ownReviewTitle: true,
        submitLabel: true, thankYouTitle: true, thankYouMessage: true, googleCtaLabel: true,
        askForName: true, showBusinessInfo: true,
      },
    })
    res.json({ copy: updated })
  }),
)

/* --------------------------------- reviews -------------------------------- */

reviewRouter.get(
  '/',
  validate(reviewListSchema, 'query'),
  handler(async (req, res) => {
    const businessId = await ownBusinessId(req.auth!.sub)
    const { rating, status, take, skip } = req.query as unknown as { rating?: number; status?: 'PUBLISHED' | 'HIDDEN'; take: number; skip: number }
    const where = { businessId, ...(rating ? { rating } : {}), ...(status ? { status } : {}) }
    const [reviews, total, stats] = await Promise.all([
      prisma.review.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        take,
        skip,
        include: { suggestion: { select: { text: true } } },
      }),
      prisma.review.count({ where }),
      reviewStats(businessId),
    ])
    res.json({ reviews, total, stats })
  }),
)

reviewRouter.patch(
  '/:id/status',
  handler(async (req, res) => {
    const businessId = await ownBusinessId(req.auth!.sub)
    const status = (req.body as { status?: string }).status
    if (status !== 'PUBLISHED' && status !== 'HIDDEN') throw ApiError.badRequest('Status must be PUBLISHED or HIDDEN.')
    const { count } = await prisma.review.updateMany({ where: { id: String(req.params.id), businessId }, data: { status } })
    if (count === 0) throw ApiError.notFound('That review does not exist.')
    res.json({ ok: true })
  }),
)
