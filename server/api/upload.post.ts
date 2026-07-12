import { nanoid } from 'nanoid'

// POST /api/upload  (multipart, field "file")  → อัปโหลดรูปเข้า Supabase Storage คืน { url }
// ต้องตั้ง env: SUPABASE_SERVICE_KEY  (SUPABASE_URL ถ้าไม่ตั้งจะเดาจาก DATABASE_URL ให้)
const BUCKET = 'photos'
const MAX_IMAGE = 8 * 1024 * 1024
const MAX_VIDEO = 60 * 1024 * 1024 // วิดีโอสั้นๆ (พรีเมียม — เปลือง egress)

// เดา https://<ref>.supabase.co จาก username ของ DATABASE_URL (postgres.<ref>)
function supabaseUrl(): string {
  if (process.env.SUPABASE_URL) return process.env.SUPABASE_URL.replace(/\/+$/, '')
  const db = process.env.DATABASE_URL || ''
  const m = db.match(/postgres\.([a-z0-9]+)/i)
  if (m) return `https://${m[1]}.supabase.co`
  throw createError({ statusCode: 500, statusMessage: 'ตั้งค่า SUPABASE_URL ไม่ครบ' })
}

let bucketReady = false
async function ensureBucket(base: string, key: string) {
  if (bucketReady) return
  try {
    await $fetch(`${base}/storage/v1/bucket`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${key}`, apikey: key, 'Content-Type': 'application/json' },
      body: { id: BUCKET, name: BUCKET, public: true },
    })
  } catch (e: any) {
    // bucket มีอยู่แล้ว (409/400 "already exists") = ไม่เป็นไร
  }
  bucketReady = true
}

export default defineEventHandler(async (event) => {
  const key = process.env.SUPABASE_SERVICE_KEY
  if (!key) {
    throw createError({ statusCode: 500, statusMessage: 'ยังไม่ได้ตั้งค่า SUPABASE_SERVICE_KEY' })
  }
  const base = supabaseUrl()

  const parts = await readMultipartFormData(event)
  const file = parts?.find(p => p.name === 'file' && p.filename)
  if (!file || !file.data?.length) {
    throw createError({ statusCode: 400, statusMessage: 'ไม่พบไฟล์รูป' })
  }
  const mime = file.type || 'image/jpeg'
  const isVideo = mime.startsWith('video/')
  if (!mime.startsWith('image/') && !isVideo) {
    throw createError({ statusCode: 400, statusMessage: 'อัปโหลดได้เฉพาะรูปหรือวิดีโอ' })
  }
  if (file.data.length > (isVideo ? MAX_VIDEO : MAX_IMAGE)) {
    throw createError({ statusCode: 413, statusMessage: isVideo ? 'วิดีโอใหญ่เกินไป (จำกัด 60MB)' : 'รูปใหญ่เกินไป (จำกัด 8MB)' })
  }

  await ensureBucket(base, key)

  const ext = (mime.split('/')[1] || 'jpg').replace('jpeg', 'jpg').split('+')[0]
  const path = `${nanoid(14)}.${ext}`

  await $fetch(`${base}/storage/v1/object/${BUCKET}/${path}`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${key}`,
      apikey: key,
      'Content-Type': mime,
      'x-upsert': 'true',
    },
    body: file.data,
  })

  return { url: `${base}/storage/v1/object/public/${BUCKET}/${path}` }
})
