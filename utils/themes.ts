// แหล่งข้อมูลกลางของ "ธีม" — ใช้ร่วมกันทั้งฟอร์มสร้าง (การ์ดพรีวิว) และหน้าพรีวิวเต็ม
// สีจริงที่ render หน้าจดหมายอยู่ใน components/LetterView.vue (เป็น CSS variables ต่อธีม)
// ตรงนี้เก็บแค่ "สีสรุป 5 สี" ไว้ทำพรีวิวย่อในการ์ด + label/คำอธิบาย

export interface ThemeDef {
  value: string
  label: string
  desc: string
  // สีสรุปสำหรับพรีวิวย่อในการ์ดเลือกธีม
  swatch: { gate: string; paper: string; primary: string; accent: string; seal: string }
}

export const THEMES: ThemeDef[] = [
  {
    value: 'classic',
    label: 'คลาสสิก',
    desc: 'ครีม–ไวน์–ทอง วินเทจอบอุ่น',
    swatch: { gate: '#7C2B39', paper: '#FCF8F0', primary: '#7C2B39', accent: '#C39A4B', seal: '#C9506A' },
  },
  {
    value: 'cutie',
    label: 'คิวตี้ 🎀',
    desc: 'สแครปบุ๊ก แนบรูป+การ์ตูน น่ารักวัยรุ่น',
    swatch: { gate: '#ff4d9d', paper: '#fff6fb', primary: '#ff2e8b', accent: '#8b5cf6', seal: '#ff6aa5' },
  },
  {
    value: 'valentine',
    label: 'วาเลนไทน์',
    desc: 'ชมพู–แดง–ทอง หวานสดใส',
    swatch: { gate: '#e23b6d', paper: '#fff5f8', primary: '#e23b6d', accent: '#ef7fa3', seal: '#ff4d6d' },
  },
  {
    value: 'modern',
    label: 'โมเดิร์น',
    desc: 'มินิมอลโทนอุ่น เรียบหรู',
    swatch: { gate: '#26231f', paper: '#faf7f2', primary: '#26241f', accent: '#b9895a', seal: '#b9895a' },
  },
  {
    value: 'midnight',
    label: 'มิดไนต์',
    desc: 'กลางคืน กระดาษเข้ม ทองดาว',
    swatch: { gate: '#101838', paper: '#141a38', primary: '#e6cf8f', accent: '#8a7bd8', seal: '#6d5fc8' },
  },
  {
    value: 'sakura',
    label: 'ซากุระ',
    desc: 'พาสเทลชมพู น่ารักละมุน',
    swatch: { gate: '#e23b6d', paper: '#fffafc', primary: '#d76e9c', accent: '#e89ab8', seal: '#ef8fb0' },
  },
]

export function themePrimary(theme: string): string {
  return (THEMES.find(t => t.value === theme) || THEMES[0]).swatch.primary
}

// ข้อมูลตัวอย่างสำหรับหน้าพรีวิว — คู่รักสมมติ ให้เห็นครบทุกส่วน (นับวัน/ไทม์ไลน์/ข้อความ)
export function sampleLetter(theme: string) {
  return {
    theme,
    sender: 'ต้น',
    recipient: 'มิ้นท์',
    startDate: '2022-02-14',
    days: 1244,
    videoUrl: '',
    heroPhoto: '',
    message:
      'ตั้งแต่วันที่ได้เจอเธอ โลกของฉันก็มีสีขึ้นมาเลย\nขอบคุณที่คอยอยู่ข้างกันเสมอนะ วันนี้ พรุ่งนี้ และตลอดไป 💗',
    timeline: [
      { date: 'Feb 2022', title: 'ครั้งแรกที่เราเจอกัน', desc: 'วันที่ฟ้าใสเป็นพิเศษ และฉันก็ใจเต้นเป็นพิเศษ', photo: '' },
      { date: 'Dec 2022', title: 'ทริปแรกด้วยกัน', desc: 'ทะเลตอนกลางคืน กับมือที่กุมไว้ไม่ปล่อย', photo: '' },
      { date: 'วันนี้', title: 'และอีกหลายปีต่อจากนี้', desc: 'ขอเดินไปด้วยกันเรื่อยๆ นะ', photo: '' },
    ],
  }
}
