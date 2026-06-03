import { createClient } from '@libsql/client'
import { readFileSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const sql = readFileSync(join(__dirname, 'prisma/migrations/20260601234358_init/migration.sql'), 'utf8')
const db = createClient({ url: 'file:' + join(__dirname, 'dev.db') })

const statements = sql.split(';').map(s => s.trim()).filter(s => s.length > 0)
for (const stmt of statements) {
  try {
    await db.execute(stmt)
  } catch (e) {
    if (!e.message.includes('already exists')) console.warn('skip:', e.message)
  }
}
console.log('✅ Database tables created')
