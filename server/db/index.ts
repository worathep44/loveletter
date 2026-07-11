import Database from 'better-sqlite3'
import { drizzle } from 'drizzle-orm/better-sqlite3'
import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'
import * as schema from './schema'

// เก็บไฟล์ DB ไว้ที่ราก project (data.sqlite)
const here = dirname(fileURLToPath(import.meta.url))
const dbPath = resolve(here, '../../data.sqlite')

const sqlite = new Database(dbPath)
sqlite.pragma('journal_mode = WAL')

// สร้างตารางถ้ายังไม่มี (prototype: ไม่ต้องรัน migration แยก)
sqlite.exec(`
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
    created_at INTEGER NOT NULL
  );
`)

export const db = drizzle(sqlite, { schema })
export { schema }
