import { join } from 'path'
import { fileURLToPath } from 'url'
import { PrismaLibSql } from '@prisma/adapter-libsql'

// Derive absolute DB path from this file's location — works even before dotenv loads
const __dirname = fileURLToPath(new URL('.', import.meta.url))
const HARDCODED_DB = `file://${join(__dirname, '../dev.db')}`

const DB_URL = (() => {
  const envUrl = process.env.DATABASE_URL
  if (envUrl && (envUrl.startsWith('file:///') || envUrl.startsWith('libsql:'))) return envUrl
  return HARDCODED_DB
})()

// PrismaLibSql (Prisma 7) takes a config object { url }, not a pre-created libsql client
const adapter = new PrismaLibSql({ url: DB_URL })

// Prisma 7 generates the client in server/node_modules
// @ts-ignore
const { PrismaClient } = await import('../../server/node_modules/.prisma/client/index.js')

// @ts-ignore
type PC = InstanceType<typeof PrismaClient>
const globalForPrisma = globalThis as unknown as { prisma: PC }

// @ts-ignore
export const prisma: PC = globalForPrisma.prisma ?? new PrismaClient({ adapter })

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
export default prisma
