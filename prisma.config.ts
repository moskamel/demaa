import path from 'node:path'
import { defineConfig } from 'prisma/config'

const dbUrl = process.env.DATABASE_URL ?? `file://${path.resolve('server/dev.db')}`

export default defineConfig({
  earlyAccess: true,
  schema: path.join('server', 'prisma', 'schema.prisma'),
  datasource: {
    url: dbUrl,
  },
  migrate: {
    async adapter() {
      const { PrismaLibSql } = await import('@prisma/adapter-libsql')
      return new PrismaLibSql({ url: dbUrl })
    }
  }
})
