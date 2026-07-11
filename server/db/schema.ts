import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core'

// หนึ่งแถว = หนึ่ง "จดหมายรัก" ที่ลูกค้าสร้าง
export const pages = sqliteTable('pages', {
  id: text('id').primaryKey(),            // slug สั้น ใช้เป็น URL /p/:id
  theme: text('theme').notNull().default('classic'),
  sender: text('sender').notNull(),       // ชื่อคนส่ง
  recipient: text('recipient').notNull(), // ชื่อคนรับ
  startDate: text('start_date'),          // วันเริ่มคบ (YYYY-MM-DD) ไว้คำนวณจำนวนวัน
  message: text('message'),               // ข้อความในจดหมาย
  videoUrl: text('video_url'),            // ลิงก์ YouTube/วิดีโอ (เว้นว่างได้)
  timeline: text('timeline'),             // JSON: [{date,title,desc}]
  status: text('status').notNull().default('paid'), // draft | paid  (เผื่อ gate ตอนต่อ payment)
  createdAt: integer('created_at').notNull(),
})

export type Page = typeof pages.$inferSelect
export type NewPage = typeof pages.$inferInsert
