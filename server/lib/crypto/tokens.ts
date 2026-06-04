// AES-256-GCM token encryption — tokens stored encrypted, never in plaintext
// Key from env: TOKEN_ENCRYPTION_KEY (32-byte hex, 64 chars)

import { createCipheriv, createDecipheriv, randomBytes } from 'node:crypto'

const ALGORITHM = 'aes-256-gcm'
const IV_LENGTH = 12    // 96 bits — GCM standard
const TAG_LENGTH = 16   // 128 bits auth tag

function getKey(): Buffer {
  const hex = process.env.TOKEN_ENCRYPTION_KEY
  if (!hex || hex.length !== 64) {
    // In dev, use a fixed key. In production this must be set.
    if (process.env.NODE_ENV === 'production') {
      throw new Error('TOKEN_ENCRYPTION_KEY must be a 64-char hex string in production')
    }
    return Buffer.from('0'.repeat(64), 'hex')
  }
  return Buffer.from(hex, 'hex')
}

/**
 * Encrypt a plaintext token.
 * Returns: base64(iv || ciphertext || authTag)
 */
export function encryptToken(plaintext: string): string {
  const key = getKey()
  const iv = randomBytes(IV_LENGTH)
  const cipher = createCipheriv(ALGORITHM, key, iv)
  const encrypted = Buffer.concat([cipher.update(plaintext, 'utf8'), cipher.final()])
  const tag = cipher.getAuthTag()
  return Buffer.concat([iv, encrypted, tag]).toString('base64')
}

/**
 * Decrypt an encrypted token.
 * Input: base64(iv || ciphertext || authTag)
 */
export function decryptToken(encrypted: string): string {
  const key = getKey()
  const buf = Buffer.from(encrypted, 'base64')
  const iv = buf.subarray(0, IV_LENGTH)
  const tag = buf.subarray(buf.length - TAG_LENGTH)
  const ciphertext = buf.subarray(IV_LENGTH, buf.length - TAG_LENGTH)
  const decipher = createDecipheriv(ALGORITHM, key, iv)
  decipher.setAuthTag(tag)
  return Buffer.concat([decipher.update(ciphertext), decipher.final()]).toString('utf8')
}

/**
 * Safely decrypt — returns null instead of throwing on tampered data.
 * Use for non-critical flows where we handle missing tokens gracefully.
 */
export function safeDecryptToken(encrypted: string | null | undefined): string | null {
  if (!encrypted) return null
  try {
    return decryptToken(encrypted)
  } catch {
    return null
  }
}

/** Generate a cryptographically random CSRF state for OAuth flows */
export function generateOAuthState(userId: string, storeId: string): string {
  const payload = JSON.stringify({ userId, storeId, ts: Date.now(), nonce: randomBytes(8).toString('hex') })
  return encryptToken(payload)
}

export interface OAuthStatePayload {
  userId: string
  storeId: string
  ts: number
  nonce: string
}

/**
 * Validate and decode OAuth state.
 * Rejects states older than 10 minutes.
 */
export function validateOAuthState(state: string): OAuthStatePayload {
  let payload: OAuthStatePayload
  try {
    payload = JSON.parse(decryptToken(state))
  } catch {
    throw new OAuthStateError('OAuth state invalid or tampered')
  }
  if (Date.now() - payload.ts > 10 * 60 * 1000) {
    throw new OAuthStateError('OAuth state expired')
  }
  return payload
}

export class OAuthStateError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'OAuthStateError'
  }
}
