import jwt from 'jsonwebtoken'

const SECRET = process.env.JWT_SECRET || 'deema-secret-2025'

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
