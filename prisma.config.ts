import path from 'node:path'
import { defineConfig } from 'prisma/config'

export default defineConfig({
  earlyAccess: true,
  schema: path.join('server', 'prisma', 'schema.prisma'),
  datasource: {
    url: process.env.DATABASE_URL ?? 'file:./server/dev.db',
  },
  migrate: {
    async adapter() {
      const { PrismaLibSql } = await import('@prisma/adapter-libsql')
      const { createClient } = await import('@libsql/client')
      const client = createClient({ url: process.env.DATABASE_URL ?? 'file:./server/dev.db' })
      return new PrismaLibSql(client)
    }
  }
})
