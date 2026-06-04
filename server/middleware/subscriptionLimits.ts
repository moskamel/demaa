// Subscription plan enforcement middleware
// Checks store limits before allowing new store connections.

import type { Response, NextFunction } from 'express'
import type { AuthRequest } from './auth.js'
import prisma from '../lib/prisma.js'

// Plan definitions — store limits per plan
const PLAN_LIMITS: Record<string, { stores: number; label: string }> = {
  starter:    { stores: 1,         label: 'المبتدئ' },
  growth:     { stores: 2,         label: 'النمو' },
  pro:        { stores: 3,         label: 'الاحترافي' },
  enterprise: { stores: Infinity,  label: 'المؤسسات' },
}

export class PlanLimitError extends Error {
  constructor(
    public readonly code: string,
    message: string,
    public readonly upgradeRequired: boolean = true,
  ) {
    super(message)
    this.name = 'PlanLimitError'
  }
}

/**
 * Check if the org can connect another store.
 * Throws PlanLimitError with Arabic message if over limit.
 */
export async function checkStoreLimit(orgId: string): Promise<void> {
  const [subscription, connectedCount] = await Promise.all([
    prisma.subscription.findUnique({ where: { organizationId: orgId } }),
    prisma.store.count({ where: { organizationId: orgId, isActive: true, isDeleted: false } }),
  ])

  const planId = subscription?.planId ?? 'starter'
  const limit = PLAN_LIMITS[planId] ?? PLAN_LIMITS.starter

  if (connectedCount >= limit.stores) {
    const limitNum = limit.stores === Infinity ? 'غير محدود' : String(limit.stores)
    throw new PlanLimitError(
      'STORE_LIMIT_REACHED',
      `باقة "${limit.label}" تسمح بـ ${limitNum} متجر فقط. لديك ${connectedCount} متجر متصل. قم بالترقية لإضافة متاجر أكثر.`,
      true,
    )
  }
}

/**
 * Express middleware — runs checkStoreLimit and returns 402 on breach.
 * Use on POST /stores/connect and OAuth callback routes.
 */
export async function enforceStoreLimit(req: AuthRequest, res: Response, next: NextFunction) {
  if (!req.orgId) { next(); return }

  try {
    await checkStoreLimit(req.orgId)
    next()
  } catch (err) {
    if (err instanceof PlanLimitError) {
      res.status(402).json({
        error: {
          code: err.code,
          message: err.message,
          upgradeRequired: err.upgradeRequired,
        },
      })
      return
    }
    next(err)
  }
}

/**
 * Get current store usage for an org.
 */
export async function getStoreUsage(orgId: string) {
  const [subscription, connectedCount, stores] = await Promise.all([
    prisma.subscription.findUnique({ where: { organizationId: orgId } }),
    prisma.store.count({ where: { organizationId: orgId, isActive: true, isDeleted: false } }),
    prisma.store.findMany({
      where: { organizationId: orgId, isActive: true, isDeleted: false },
      select: { id: true, name: true, platform: true, connectionStatus: true },
    }),
  ])

  const planId = subscription?.planId ?? 'starter'
  const limit = PLAN_LIMITS[planId] ?? PLAN_LIMITS.starter

  return {
    planId,
    planLabel: limit.label,
    used: connectedCount,
    limit: limit.stores,
    canAddMore: connectedCount < limit.stores,
    stores,
  }
}
