import { nanoid } from 'nanoid'
import QRCode from 'qrcode'
import { db } from '../db'
import { pages } from '../db/schema'

// POST /api/pages  → สร้างจดหมายใหม่ คืน { id, url, qr }
export default defineEventHandler(async (event) => {
  const body = await readBody(event)

  const sender = (body?.sender || '').toString().trim()
  const recipient = (body?.recipient || '').toString().trim()
  if (!sender || !recipient) {
    throw createError({ statusCode: 400, statusMessage: 'ต้องกรอกชื่อผู้ส่งและผู้รับ' })
  }

  // timeline: รับเป็น array อยู่แล้ว หรือ string JSON ก็ได้
  let timeline = body?.timeline
  if (Array.isArray(timeline)) timeline = JSON.stringify(timeline)
  else if (typeof timeline !== 'string') timeline = null

  const id = nanoid(10)
  await db.insert(pages).values({
    id,
    theme: (body?.theme || 'classic').toString(),
    sender,
    recipient,
    startDate: body?.startDate ? body.startDate.toString() : null,
    message: body?.message ? body.message.toString() : null,
    videoUrl: body?.videoUrl ? body.videoUrl.toString() : null,
    timeline,
    status: 'paid',
    createdAt: Date.now(),
  })

  // สร้าง URL สาธารณะจาก host ที่เรียกเข้ามา (รองรับ dev/prod/หลายโดเมน)
  const origin = getRequestURL(event).origin
  const url = `${origin}/p/${id}`
  const qr = await QRCode.toDataURL(url, {
    margin: 1,
    width: 480,
    color: { dark: '#5A1E29', light: '#FBF3E7' },
  })

  return { id, url, qr }
})
