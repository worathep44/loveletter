import postgres from 'postgres'
import { drizzle } from 'drizzle-orm/postgres-js'
import * as schema from './schema'

const url = process.env.DATABASE_URL
if (!url) {
  throw new Error('DATABASE_URL ยังไม่ได้ตั้งค่า — ใส่ connection string ของ Postgres ในไฟล์ .env')
}

// prepare:false ให้เข้ากันได้กับ connection pooler ของ Supabase/Neon (transaction mode)
const sql = postgres(url, { prepare: false })

export const db = drizzle(sql, { schema })
export { schema }

// สร้างตารางถ้ายังไม่มี — เรียกครั้งเดียว (กัน top-level await ที่ build target ไม่รองรับ)
let schemaReady: Promise<unknown> | null = null
export function ensureSchema() {
  if (!schemaReady) {
    schemaReady = (async () => {
      await sql`
        CREATE TABLE IF NOT EXISTS pages (
          id TEXT PRIMARY KEY,
          theme TEXT NOT NULL DEFAULT 'classic',
          sender TEXT NOT NULL,
          recipient TEXT NOT NULL,
          start_date TEXT,
          message TEXT,
          video_url TEXT,
          timeline TEXT,
          status TEXT NOT NULL DEFAULT 'paid',
          created_at BIGINT NOT NULL
        );
      `
      // เพิ่มคอลัมน์ใหม่แบบ idempotent (ตารางเดิมที่มีอยู่แล้วจะได้คอลัมน์นี้ด้วย)
      await sql`ALTER TABLE pages ADD COLUMN IF NOT EXISTS hero_photo TEXT;`
      await sql`ALTER TABLE pages ADD COLUMN IF NOT EXISTS photos TEXT;`
    })().catch((e) => { schemaReady = null; throw e })
  }
  return schemaReady
}
