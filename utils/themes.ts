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
    value: 'gift',
    label: 'เซอร์ไพรส์ 🎁',
    desc: 'เปิดกล่องของขวัญ · รูปหมุน 3D + คอนเฟตตี',
    swatch: { gate: '#3a1a5c', paper: '#180f2e', primary: '#ffd66b', accent: '#ff5fa8', seal: '#ff4d6d' },
  },
  {
    value: 'galaxy',
    label: 'กาแล็กซี 🌌',
    desc: 'พุ่งสู่อวกาศ · รูปเป็นดวงดาว → รวมเป็นหัวใจ',
    swatch: { gate: '#0d0722', paper: '#05030f', primary: '#ffd66b', accent: '#b98cff', seal: '#ff5f9e' },
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
    photos: [],
    message:
      'ตั้งแต่วันที่ได้เจอเธอ โลกของฉันก็มีสีขึ้นมาเลย\nขอบคุณที่คอยอยู่ข้างกันเสมอนะ วันนี้ พรุ่งนี้ และตลอดไป 💗',
    timeline: [
      { date: 'Feb 2022', title: 'ครั้งแรกที่เราเจอกัน', desc: 'วันที่ฟ้าใสเป็นพิเศษ และฉันก็ใจเต้นเป็นพิเศษ', photo: '' },
      { date: 'Dec 2022', title: 'ทริปแรกด้วยกัน', desc: 'ทะเลตอนกลางคืน กับมือที่กุมไว้ไม่ปล่อย', photo: '' },
      { date: 'วันนี้', title: 'และอีกหลายปีต่อจากนี้', desc: 'ขอเดินไปด้วยกันเรื่อยๆ นะ', photo: '' },
    ],
  }
}
