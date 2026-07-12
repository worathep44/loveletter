// จัดการวิดีโอ — ตรวจ source จากลิงก์ + poster + embed url
export interface VideoItem {
  url: string
  source: 'youtube' | 'tiktok' | 'file'
  id?: string
  poster?: string
}

// แปลงลิงก์ที่ลูกค้าวาง → VideoItem (คืน null ถ้าไม่รู้จัก)
export function detectVideo(raw: string): VideoItem | null {
  const url = (raw || '').trim()
  if (!url) return null
  const yt = url.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|shorts\/|live\/))([\w-]{11})/)
  if (yt) return { url, source: 'youtube', id: yt[1], poster: `https://i.ytimg.com/vi/${yt[1]}/hqdefault.jpg` }
  const tt = url.match(/tiktok\.com\/(?:.*\/video\/|embed\/(?:v2\/)?)(\d{6,})/)
  if (tt) return { url, source: 'tiktok', id: tt[1] }
  if (/tiktok\.com/.test(url)) return { url, source: 'tiktok' } // ลิงก์สั้น (เล่นผ่าน embed อาจต้องลิงก์เต็ม)
  return null
}

// url สำหรับ embed เล่นในหน้าจดหมาย (muted=true ตอน auto-เล่น เพื่อให้เบราว์เซอร์ยอมเล่นเลย)
export function embedUrl(v: VideoItem, muted = false): string {
  if (v.source === 'youtube' && v.id) return `https://www.youtube.com/embed/${v.id}?autoplay=1&rel=0&playsinline=1${muted ? '&mute=1' : ''}`
  if (v.source === 'tiktok' && v.id) return `https://www.tiktok.com/embed/v2/${v.id}`
  return v.url
}
