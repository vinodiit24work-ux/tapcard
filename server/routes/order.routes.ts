import { Router } from 'express'
import { prisma } from '../lib/prisma.js'
import { ApiError, handler } from '../utils/http.js'
import { validate } from '../middleware/validate.js'
import { requireAuth, requireAdmin } from '../middleware/auth.js'
import { orderReference } from '../utils/reference.js'
import { orderInclude, priceOrder } from '../services/order.service.js'
import { createOrderSchema, updateOrderSchema } from '../validators/order.validators.js'

export const orderRouter = Router()
orderRouter.use(requireAuth)

/** A quote the checkout can show before committing — priced by the same code as the order. */
orderRouter.post(
  '/quote',
  handler(async (req, res) => {
    const body = req.body as { items?: { sku: string; quantity: number }[]; couponCode?: string }
    if (!body.items?.length) throw ApiError.badRequest('Your cart is empty.')
    const quote = await priceOrder(
      body.items.map((i) => ({ sku: i.sku, quantity: i.quantity, businessName: '', finish: 'matte', colour: 'white' })),
      body.couponCode,
      req.auth!.sub,
    )
    res.json({
      subtotalPaise: quote.subtotalPaise,
      discountPaise: quote.discountPaise,
      shippingPaise: quote.shippingPaise,
      taxPaise: quote.taxPaise,
      totalPaise: quote.totalPaise,
    })
  }),
)

orderRouter.post(
  '/',
  validate(createOrderSchema),
  handler(async (req, res) => {
    const body = req.body as {
      items: { sku: string; quantity: number; businessName: string; finish: string; colour: string; notes?: string }[]
      address: { name: string; phone: string; line1: string; line2?: string; city: string; state: string; pincode: string; country: string }
      email: string
      gstin?: string
      couponCode?: string
      notes?: string
    }

    const quote = await priceOrder(body.items, body.couponCode, req.auth!.sub)

    const order = await prisma.$transaction(async (tx) => {
      const address = await tx.address.create({ data: { ...body.address, userId: req.auth!.sub } })

      const created = await tx.order.create({
        data: {
          reference: orderReference(),
          userId: req.auth!.sub,
          // An order is PENDING until a payment is verified server-side. Nothing here
          // marks it paid; that happens only after Razorpay confirms in Phase 3.
          status: 'PENDING',
          subtotalPaise: quote.subtotalPaise,
          discountPaise: quote.discountPaise,
          shippingPaise: quote.shippingPaise,
          taxPaise: quote.taxPaise,
          totalPaise: quote.totalPaise,
          couponId: quote.coupon?.id,
          addressId: address.id,
          gstin: body.gstin || null,
          notes: body.notes || null,
          items: {
            create: quote.items.map((i) => ({
              productId: i.productId,
              quantity: i.quantity,
              unitPricePaise: i.unitPricePaise,
              businessName: i.businessName,
              finish: i.finish,
              colour: i.colour,
              notes: i.notes,
            })),
          },
        },
      })

      if (quote.coupon) {
        await tx.coupon.update({ where: { id: quote.coupon.id }, data: { usedCount: { increment: 1 } } })
        await tx.couponRedemption.create({ data: { couponId: quote.coupon.id, userId: req.auth!.sub, orderId: created.id } })
      }

      await tx.notification.create({
        data: { userId: req.auth!.sub, title: `Order ${created.reference} received`, href: '/dashboard/orders' },
      })

      return tx.order.findUniqueOrThrow({ where: { id: created.id }, include: orderInclude })
    })

    res.status(201).json({ order })
  }),
)

orderRouter.get(
  '/',
  handler(async (req, res) => {
    const orders = await prisma.order.findMany({
      where: { userId: req.auth!.sub },
      include: orderInclude,
      orderBy: { placedAt: 'desc' },
      take: 50,
    })
    res.json({ orders })
  }),
)

orderRouter.get(
  '/:reference',
  handler(async (req, res) => {
    const order = await prisma.order.findFirst({
      // Scoped by user as well as reference, so guessing a reference reveals nothing.
      where: { reference: String(req.params.reference), userId: req.auth!.sub },
      include: orderInclude,
    })
    if (!order) throw ApiError.notFound('That order does not exist.')
    res.json({ order })
  }),
)

/* ------------------------------------------------------------------ admin -- */

export const adminOrderRouter = Router()
adminOrderRouter.use(requireAuth, requireAdmin)

adminOrderRouter.get(
  '/',
  handler(async (req, res) => {
    const status = typeof req.query.status === 'string' && req.query.status !== 'ALL' ? req.query.status : undefined
    const q = typeof req.query.q === 'string' ? req.query.q.trim() : ''
    const orders = await prisma.order.findMany({
      where: {
        ...(status ? { status: status as never } : {}),
        ...(q ? { OR: [{ reference: { contains: q, mode: 'insensitive' as const } }, { user: { name: { contains: q, mode: 'insensitive' as const } } }] } : {}),
      },
      include: { ...orderInclude, user: { select: { name: true, email: true } } },
      orderBy: { placedAt: 'desc' },
      take: 100,
    })
    const counts = await prisma.order.groupBy({ by: ['status'], _count: { _all: true } })
    const revenue = await prisma.order.aggregate({ where: { status: { in: ['PAID', 'PRODUCTION', 'SHIPPED', 'DELIVERED'] } }, _sum: { totalPaise: true } })
    res.json({
      orders,
      counts: Object.fromEntries(counts.map((c) => [c.status, c._count._all])),
      revenuePaise: revenue._sum.totalPaise ?? 0,
    })
  }),
)

adminOrderRouter.patch(
  '/:id',
  validate(updateOrderSchema),
  handler(async (req, res) => {
    const body = req.body as { status?: string; trackingNumber?: string | null; shippingProvider?: string | null }
    const now = new Date()
    const order = await prisma.order.update({
      where: { id: String(req.params.id) },
      data: {
        ...(body.status ? { status: body.status as never } : {}),
        ...(body.trackingNumber !== undefined ? { trackingNumber: body.trackingNumber } : {}),
        ...(body.shippingProvider !== undefined ? { shippingProvider: body.shippingProvider } : {}),
        ...(body.status === 'SHIPPED' ? { shippedAt: now } : {}),
        ...(body.status === 'DELIVERED' ? { deliveredAt: now } : {}),
      },
      include: { ...orderInclude, user: { select: { name: true, email: true } } },
    })

    await prisma.auditLog.create({
      data: {
        actorId: req.auth!.sub,
        action: 'order.update',
        entityType: 'Order',
        entityId: order.id,
        summary: `Order ${order.reference} → ${body.status ?? 'updated'}${body.trackingNumber ? ` (${body.trackingNumber})` : ''}`,
      },
    })

    if (body.status) {
      await prisma.notification.create({
        data: { userId: order.userId, title: `Order ${order.reference} is now ${body.status.toLowerCase().replace('_', ' ')}`, href: '/dashboard/orders' },
      })
    }

    res.json({ order })
  }),
)
