import type { Request, Response, NextFunction } from 'express'
import { verifyToken } from '../lib/jwt.js'

export interface AuthRequest extends Request {
  userId?: string
  orgId?: string
  role?: string
}

export function requireAuth(req: AuthRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization
  if (!authHeader?.startsWith('Bearer ')) {
    res.status(401).json({ error: { code: 'UNAUTHORIZED', message: 'مطلوب تسجيل الدخول' } })
    return
  }
  try {
    const payload = verifyToken(authHeader.slice(7))
    req.userId = payload.userId
    req.orgId = payload.orgId
    req.role = payload.role
    next()
  } catch {
    res.status(401).json({ error: { code: 'INVALID_TOKEN', message: 'جلسة منتهية، يرجى تسجيل الدخول مجدداً' } })
  }
}
