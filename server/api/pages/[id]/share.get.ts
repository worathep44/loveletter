import { eq } from 'drizzle-orm'
import QRCode from 'qrcode'
import { db, ensureSchema } from '../../../db'
import { pages } from '../../../db/schema'

// GET /api/pages/:id/share  → สร้าง QR + ลิงก์ใหม่ของจดหมายที่มีอยู่แล้ว (เผื่อลูกค้าลืม)
export default defineEventHandler(async (event) => {
  await ensureSchema()
  const id = getRouterParam(event, 'id') || ''

  const rows = await db.select({ id: pages.id }).from(pages).where(eq(pages.id, id)).limit(1)
  if (!rows[0]) {
    throw createError({ statusCode: 404, statusMessage: 'ไม่พบจดหมายนี้' })
  }

  const siteUrl = useRuntimeConfig(event).public.siteUrl?.toString().replace(/\/+$/, '')
  const origin = siteUrl || getRequestURL(event, { xForwardedHost: true, xForwardedProto: true }).origin
  const url = `${origin}/p/${id}`
  const qr = await QRCode.toDataURL(url, {
    margin: 1,
    width: 480,
    color: { dark: '#5A1E29', light: '#FBF3E7' },
  })

  return { id, url, qr }
})
