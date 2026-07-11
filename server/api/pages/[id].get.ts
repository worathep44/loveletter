import { eq } from 'drizzle-orm'
import { db } from '../../db'
import { pages } from '../../db/schema'

// GET /api/pages/:id  → ข้อมูลจดหมายสำหรับ render หน้า /p/:id
export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id') || ''
  const row = db.select().from(pages).where(eq(pages.id, id)).get()

  if (!row) {
    throw createError({ statusCode: 404, statusMessage: 'ไม่พบจดหมายนี้' })
  }

  // แปลง timeline JSON string → array ให้หน้าใช้ง่าย
  let timeline: any[] = []
  if (row.timeline) {
    try { timeline = JSON.parse(row.timeline) } catch { timeline = [] }
  }

  // คำนวณจำนวนวันที่รักกัน จาก startDate ถึงวันนี้
  let days: number | null = null
  if (row.startDate) {
    const start = new Date(row.startDate + 'T00:00:00').getTime()
    if (!Number.isNaN(start)) {
      days = Math.max(0, Math.floor((Date.now() - start) / 86400000))
    }
  }

  return { ...row, timeline, days }
})
