// Active store context middleware
// Injects the currently active store + platform into every authenticated request.
// Precedence: query param ?storeId > body.storeId > org's activeStoreId > first connected store

import type { Response, NextFunction } from 'express'
import type { AuthRequest } from './auth.js'
import prisma from '../lib/prisma.js'
import { safeDecryptToken } from '../lib/crypto/tokens.js'
import { isValidPlatform } from '../lib/platforms/registry.js'
import type { Platform } from '../lib/platforms/types.js'

export interface StoreContext {
  id: string
  name: string
  platform: Platform
  accessToken: string        // decrypted
  refreshToken: string | null // decrypted
  tokenExpiresAt: Date | null
  domain: string | null
  externalStoreId: string | null
  platformMeta: Record<string, unknown>
}

export interface StoreRequest extends AuthRequest {
  store?: StoreContext
  storeId?: string
}

/**
 * Middleware that resolves the active store for authenticated routes.
 * Attaches req.store and req.storeId.
 * Does NOT block requests with no store — callers check req.store themselves.
 */
export async function resolveActiveStore(req: StoreRequest, _res: Response, next: NextFunction) {
  if (!req.orgId) { next(); return }

  try {
    // 1. Determine which store the request targets
    const requestedStoreId =
      (req.query.storeId as string | undefined) ||
      (req.body?.storeId as string | undefined)

    let store = requestedStoreId
      ? await prisma.store.findFirst({
          where: { id: requestedStoreId, organizationId: req.orgId, isActive: true, isDeleted: false },
        })
      : null

    if (!store) {
      // Fall back to org's persisted activeStoreId
      const org = await prisma.organization.findUnique({ where: { id: req.orgId }, select: { activeStoreId: true } })
      if (org?.activeStoreId) {
        store = await prisma.store.findFirst({
          where: { id: org.activeStoreId, organizationId: req.orgId, isActive: true, isDeleted: false },
        })
      }
    }

    if (!store) {
      // Fall back to first connected store
      store = await prisma.store.findFirst({
        where: { organizationId: req.orgId, isActive: true, isDeleted: false, connectionStatus: 'connected' },
        orderBy: { createdAt: 'asc' },
      })
    }

    if (!store) { next(); return }

    // 2. Validate platform
    if (!isValidPlatform(store.platform)) { next(); return }

    // 3. Decrypt tokens
    const accessToken = safeDecryptToken(store.accessToken)
    if (!accessToken) { next(); return }

    req.storeId = store.id
    req.store = {
      id: store.id,
      name: store.name,
      platform: store.platform as Platform,
      accessToken,
      refreshToken: safeDecryptToken(store.refreshToken),
      tokenExpiresAt: store.tokenExpiresAt,
      domain: store.domain,
      externalStoreId: store.externalStoreId,
      platformMeta: safeParseJson(store.platformMeta),
    }
  } catch {
    // Never block the request — just don't inject store context
  }

  next()
}

/**
 * Strict version — rejects requests where no valid store context is found.
 * Use on routes that definitely require a store (e.g. /orders, /products).
 */
export function requireStore(req: StoreRequest, res: Response, next: NextFunction) {
  if (!req.store) {
    res.status(422).json({
      error: {
        code: 'NO_ACTIVE_STORE',
        message: 'لا يوجد متجر متصل. يرجى ربط متجرك أولاً.',
        action: 'connect_store',
      },
    })
    return
  }
  next()
}

/**
 * Switch the active store for an org.
 * Verifies ownership before persisting.
 */
export async function switchActiveStore(orgId: string, storeId: string): Promise<boolean> {
  const store = await prisma.store.findFirst({
    where: { id: storeId, organizationId: orgId, isActive: true, isDeleted: false },
  })
  if (!store) return false

  await prisma.organization.update({
    where: { id: orgId },
    data: { activeStoreId: storeId },
  })
  return true
}

function safeParseJson(s: string | null | undefined): Record<string, unknown> {
  if (!s) return {}
  try { return JSON.parse(s) } catch { return {} }
}
