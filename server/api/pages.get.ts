import { desc, ilike, or } from 'drizzle-orm'
import { db, ensureSchema } from '../db'
import { pages } from '../db/schema'

// GET /api/pages?q=ชื่อ  → รายการจดหมายที่สร้างไว้ (ใหม่สุดก่อน) สำหรับหลังบ้าน
// ไว้ให้ค้นเวลาลูกค้าลืม QR/ลิงก์ แล้วดึงกลับมาได้
export default defineEventHandler(async (event) => {
  await ensureSchema()
  const q = (getQuery(event).q || '').toString().trim()

  const cols = {
    id: pages.id,
    sender: pages.sender,
    recipient: pages.recipient,
    theme: pages.theme,
    createdAt: pages.createdAt,
  }

  const rows = q
    ? await db.select(cols).from(pages)
        .where(or(ilike(pages.sender, `%${q}%`), ilike(pages.recipient, `%${q}%`)))
        .orderBy(desc(pages.createdAt)).limit(200)
    : await db.select(cols).from(pages)
        .orderBy(desc(pages.createdAt)).limit(200)

  const origin = publicOrigin(event)
  return { pages: rows.map(r => ({ ...r, url: `${origin}/p/${r.id}` })) }
})
