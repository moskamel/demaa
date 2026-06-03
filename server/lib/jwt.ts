import jwt from 'jsonwebtoken'

if (!process.env.JWT_SECRET) {
  console.warn('[security] JWT_SECRET not set — using insecure default. Set JWT_SECRET in production!')
}
const SECRET = process.env.JWT_SECRET || 'deema-secret-dev-only-change-in-production-48chars+'

export interface JwtPayload {
  userId: string
  orgId: string
  role: string
}

export function signToken(payload: JwtPayload): string {
  return jwt.sign(payload, SECRET, { expiresIn: '7d' })
}

export function verifyToken(token: string): JwtPayload {
  return jwt.verify(token, SECRET) as JwtPayload
}
