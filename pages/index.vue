<script setup lang="ts">
useHead({ title: 'สร้างจดหมายรัก · หลังบ้าน' })

// สีสำหรับพรีวิวย่อในการ์ดเลือกธีม (THEMES = auto-import จาก utils/themes.ts)
function mockVars(t: ThemeDef) {
  return {
    '--m-gate': t.swatch.gate,
    '--m-paper': t.swatch.paper,
    '--m-primary': t.swatch.primary,
    '--m-accent': t.swatch.accent,
    '--m-seal': t.swatch.seal,
  }
}

const form = reactive({
  theme: 'classic',
  sender: '',
  recipient: '',
  startDate: '',
  videoUrl: '',
  message: '',
})

const timeline = ref<{ date: string; title: string; desc: string }[]>([
  { date: '', title: '', desc: '' },
])
function addBeat() { timeline.value.push({ date: '', title: '', desc: '' }) }
function removeBeat(i: number) { timeline.value.splice(i, 1) }

const loading = ref(false)
const result = ref<{ id: string; url: string; qr: string } | null>(null)
const errorMsg = ref('')
const copied = ref(false)

async function submit() {
  errorMsg.value = ''
  if (!form.sender.trim() || !form.recipient.trim()) {
    errorMsg.value = 'กรุณากรอกชื่อผู้ส่งและผู้รับ'
    return
  }
  loading.value = true
  result.value = null
  try {
    const cleanTimeline = timeline.value.filter(b => b.title.trim() || b.desc.trim())
    const res = await $fetch<{ id: string; url: string; qr: string }>('/api/pages', {
      method: 'POST',
      body: { ...form, timeline: cleanTimeline },
    })
    result.value = res
  } catch (e: any) {
    errorMsg.value = e?.data?.statusMessage || e?.statusMessage || 'เกิดข้อผิดพลาด ลองใหม่อีกครั้ง'
  } finally {
    loading.value = false
  }
}

async function copyLink() {
  if (!result.value) return
  await navigator.clipboard.writeText(result.value.url)
  copied.value = true
  setTimeout(() => (copied.value = false), 1600)
}

function reset() {
  result.value = null
}
</script>

<template>
  <div class="wrap">
    <header class="top">
      <div class="brand">💌 <span>LoveLetter</span><small>Studio</small></div>
      <div class="tag">หลังบ้านตัวสร้างจดหมายรัก · prototype</div>
    </header>

    <main class="grid">
      <!-- ฟอร์มสร้าง -->
      <section class="panel form">
        <h1>สร้างจดหมายใหม่</h1>
        <p class="sub">กรอกข้อมูล แล้วระบบจะสร้างหน้าเว็บ + QR ให้ทันที</p>

        <div class="fld">
          <span>ธีม <em>(กดการ์ดเพื่อเลือก · “ดูตัวอย่าง” เปิดหน้าจริง)</em></span>
          <div class="tcards">
            <label v-for="t in THEMES" :key="t.value" class="tcard" :class="{ sel: form.theme === t.value }">
              <input type="radio" :value="t.value" v-model="form.theme" name="theme" />
              <div class="mock" :style="mockVars(t)">
                <div class="mock-top">
                  <div class="mock-seal"></div>
                </div>
                <div class="mock-bot">
                  <div class="mock-name"></div>
                  <div class="mock-line"></div>
                  <div class="mock-line short"></div>
                </div>
              </div>
              <div class="tinfo">
                <strong>{{ t.label }}</strong>
                <small>{{ t.desc }}</small>
              </div>
              <a class="tprev" :href="`/preview?theme=${t.value}`" target="_blank" @click.stop>ดูตัวอย่าง ▸</a>
              <span class="tcheck">✓</span>
            </label>
          </div>
        </div>

        <div class="row">
          <label class="fld">
            <span>จากใคร (ผู้ส่ง)</span>
            <input v-model="form.sender" placeholder="เช่น ต้น" />
          </label>
          <label class="fld">
            <span>ถึงใคร (ผู้รับ)</span>
            <input v-model="form.recipient" placeholder="เช่น มิ้นท์" />
          </label>
        </div>

        <label class="fld">
          <span>วันเริ่มคบ <em>(ไว้นับจำนวนวันที่รักกัน)</em></span>
          <input v-model="form.startDate" type="date" />
        </label>

        <label class="fld">
          <span>ลิงก์วิดีโอ <em>(YouTube — เว้นว่างได้)</em></span>
          <input v-model="form.videoUrl" placeholder="https://youtu.be/..." />
        </label>

        <label class="fld">
          <span>ข้อความในจดหมาย</span>
          <textarea v-model="form.message" rows="4" placeholder="เขียนความในใจถึงเขา..."></textarea>
        </label>

        <div class="tl">
          <div class="tl-head">
            <span>ช่วงเวลาของเรา (ไทม์ไลน์)</span>
            <button type="button" class="ghost" @click="addBeat">+ เพิ่มช่วง</button>
          </div>
          <div v-for="(b, i) in timeline" :key="i" class="beat">
            <input v-model="b.date" class="mini" placeholder="เช่น Feb 2022" />
            <input v-model="b.title" placeholder="หัวข้อ เช่น ครั้งแรกที่เจอ" />
            <input v-model="b.desc" placeholder="รายละเอียดสั้นๆ" />
            <button type="button" class="rm" @click="removeBeat(i)" v-if="timeline.length > 1">✕</button>
          </div>
        </div>

        <p v-if="errorMsg" class="err">{{ errorMsg }}</p>

        <button class="cta" :disabled="loading" @click="submit">
          {{ loading ? 'กำลังสร้าง...' : 'สร้างจดหมาย + QR ✦' }}
        </button>
      </section>

      <!-- ผลลัพธ์ -->
      <section class="panel result">
        <template v-if="!result">
          <div class="empty">
            <div class="emoji">🔗</div>
            <h2>QR & ลิงก์จะขึ้นตรงนี้</h2>
            <p>กรอกข้อมูลด้านซ้ายแล้วกด “สร้างจดหมาย”</p>
          </div>
        </template>

        <template v-else>
          <div class="done">
            <div class="check">✓</div>
            <h2>สร้างสำเร็จ!</h2>
          </div>

          <div class="qrbox">
            <img :src="result.qr" alt="QR code" />
          </div>

          <div class="linkrow">
            <input :value="result.url" readonly />
            <button class="copy" @click="copyLink">{{ copied ? 'คัดลอกแล้ว ✓' : 'คัดลอก' }}</button>
          </div>

          <div class="actions">
            <a class="open" :href="result.url" target="_blank">เปิดดูจดหมาย ▸</a>
            <button class="ghost2" @click="reset">สร้างใหม่</button>
          </div>

          <p class="hint">ลูกค้าเอา QR นี้ไปปริ้นใส่การ์ด หรือส่งลิงก์ให้คนรักได้เลย</p>
        </template>
      </section>
    </main>
  </div>
</template>

<style scoped>
.wrap{
  min-height:100dvh;
  font-family:"SF Pro Display","Helvetica Neue","Segoe UI","Noto Sans Thai",system-ui,sans-serif;
  background:
    radial-gradient(80% 60% at 85% 0%, #ffe9d9 0%, transparent 55%),
    radial-gradient(70% 50% at 0% 100%, #ffe1e8 0%, transparent 50%),
    #f6f3ef;
  color:#2a2320;
  padding:28px clamp(16px,4vw,56px) 60px;
}
.top{display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:10px;margin-bottom:28px}
.brand{display:flex;align-items:baseline;gap:9px;font-size:22px;font-weight:700}
.brand span{background:linear-gradient(90deg,#c0304a,#e0662f);-webkit-background-clip:text;background-clip:text;-webkit-text-fill-color:transparent}
.brand small{font-size:11px;letter-spacing:.22em;text-transform:uppercase;color:#b08968;font-weight:600}
.tag{font-size:12.5px;color:#9a8778;background:#fff;padding:7px 14px;border-radius:20px;border:1px solid #eadfd4}

.grid{display:grid;grid-template-columns:1.35fr 1fr;gap:22px;max-width:1080px;margin:0 auto;align-items:start}
@media(max-width:820px){.grid{grid-template-columns:1fr}}

.panel{background:#fff;border:1px solid #eee3d8;border-radius:22px;padding:28px;
  box-shadow:0 20px 50px -34px rgba(120,60,40,.4)}

.form h1{font-size:24px;font-weight:700}
.sub{color:#9a8778;font-size:14px;margin:4px 0 22px}

.fld{display:block;margin-bottom:16px}
.fld>span{display:block;font-size:13px;font-weight:600;margin-bottom:7px;color:#5a4a40}
.fld>span em{font-style:normal;font-weight:400;color:#b0a094}
.fld input,.fld select,.fld textarea,.linkrow input,.beat input{
  width:100%;font:inherit;font-size:15px;padding:12px 14px;border:1.5px solid #ece0d4;
  border-radius:12px;background:#fdfbf8;color:#2a2320;transition:border-color .15s, box-shadow .15s;
}
.fld input:focus,.fld select:focus,.fld textarea:focus,.beat input:focus{
  outline:none;border-color:#e0662f;box-shadow:0 0 0 3px rgba(224,102,47,.14)
}
.fld textarea{resize:vertical}

/* ===== การ์ดเลือกธีม ===== */
.tcards{display:grid;grid-template-columns:repeat(3,1fr);gap:12px}
@media(max-width:640px){.tcards{grid-template-columns:repeat(2,1fr)}}
.tcard{
  position:relative;display:block;cursor:pointer;border:2px solid #ece0d4;border-radius:16px;
  padding:9px;background:#fff;transition:border-color .15s, box-shadow .15s, transform .12s
}
.tcard:hover{transform:translateY(-2px);box-shadow:0 14px 30px -20px rgba(120,60,40,.5)}
.tcard input{position:absolute;opacity:0;pointer-events:none}
.tcard.sel{border-color:#e0662f;box-shadow:0 0 0 3px rgba(224,102,47,.14)}
.mock{border-radius:11px;overflow:hidden;border:1px solid rgba(0,0,0,.06);height:104px;display:flex;flex-direction:column}
.mock-top{
  flex:0 0 58%;display:grid;place-items:center;
  background:radial-gradient(120% 90% at 50% 15%, color-mix(in srgb, var(--m-gate) 78%, #fff) 0%, var(--m-gate) 100%)
}
.mock-seal{width:26px;height:26px;border-radius:50%;background:var(--m-seal);
  box-shadow:inset 0 2px 4px rgba(255,255,255,.4),inset 0 -3px 6px rgba(0,0,0,.25),0 3px 6px -2px rgba(0,0,0,.4)}
.mock-bot{flex:1;background:var(--m-paper);padding:9px 11px;display:flex;flex-direction:column;justify-content:center;gap:5px}
.mock-name{height:7px;width:62%;border-radius:4px;background:var(--m-primary)}
.mock-line{height:4px;width:80%;border-radius:3px;background:var(--m-accent);opacity:.65}
.mock-line.short{width:52%}
.tinfo{margin:9px 3px 2px}
.tinfo strong{display:block;font-size:14px;font-weight:700;color:#3a2d26}
.tinfo small{display:block;font-size:11.5px;color:#a89a8c;margin-top:1px;line-height:1.35}
.tprev{display:inline-block;margin:6px 3px 2px;font-size:12px;font-weight:600;color:#c0562f;text-decoration:none}
.tprev:hover{text-decoration:underline}
.tcheck{
  position:absolute;top:8px;right:8px;width:22px;height:22px;border-radius:50%;
  background:#e0662f;color:#fff;font-size:12px;font-weight:700;display:grid;place-items:center;
  opacity:0;transform:scale(.5);transition:.15s
}
.tcard.sel .tcheck{opacity:1;transform:scale(1)}

.row{display:grid;grid-template-columns:1fr 1fr;gap:14px}
@media(max-width:520px){.row{grid-template-columns:1fr}}

.tl{margin:6px 0 18px;padding:16px;background:#fbf6f0;border:1px dashed #e6d5c4;border-radius:14px}
.tl-head{display:flex;justify-content:space-between;align-items:center;margin-bottom:12px}
.tl-head span{font-size:13px;font-weight:700;color:#5a4a40}
.beat{display:grid;grid-template-columns:110px 1fr 1.3fr auto;gap:8px;margin-bottom:8px;align-items:center}
@media(max-width:560px){.beat{grid-template-columns:1fr 1fr;position:relative}}
.beat .mini{max-width:100%}
.rm{border:none;background:#f4e3dc;color:#c0304a;width:32px;height:32px;border-radius:9px;cursor:pointer;font-size:13px}
.ghost{border:1px solid #e6d5c4;background:#fff;color:#c0562f;padding:6px 12px;border-radius:9px;cursor:pointer;font-size:13px;font-weight:600}

.err{color:#c0304a;font-size:14px;margin:4px 0 12px;font-weight:600}

.cta{width:100%;border:none;cursor:pointer;font:inherit;font-size:16px;font-weight:700;color:#fff;
  padding:16px;border-radius:14px;margin-top:6px;letter-spacing:.02em;
  background:linear-gradient(100deg,#c0304a,#e0662f);
  box-shadow:0 14px 30px -12px rgba(192,48,74,.6);transition:transform .12s, filter .15s}
.cta:hover:not(:disabled){transform:translateY(-1px);filter:brightness(1.05)}
.cta:disabled{opacity:.6;cursor:default}

/* result */
.result{position:sticky;top:24px}
.empty{text-align:center;padding:50px 10px;color:#b0a094}
.empty .emoji{font-size:46px;margin-bottom:14px}
.empty h2{font-size:18px;color:#7a6a5e;font-weight:700}
.empty p{font-size:14px;margin-top:6px}

.done{display:flex;align-items:center;gap:12px;margin-bottom:20px}
.done .check{width:38px;height:38px;border-radius:50%;background:#2fa96b;color:#fff;display:grid;place-items:center;font-size:20px;font-weight:700}
.done h2{font-size:20px;font-weight:700}
.qrbox{background:#FBF3E7;border-radius:18px;padding:18px;display:grid;place-items:center;border:1px solid #eadfd0}
.qrbox img{width:210px;height:210px;image-rendering:pixelated}
.linkrow{display:flex;gap:8px;margin:16px 0 12px}
.linkrow input{font-size:13px;color:#7a6a5e}
.copy{flex:none;border:none;background:#2a2320;color:#fff;padding:0 16px;border-radius:12px;cursor:pointer;font:inherit;font-weight:600;font-size:14px}
.actions{display:flex;gap:10px}
.open{flex:1;text-align:center;text-decoration:none;background:linear-gradient(100deg,#c0304a,#e0662f);color:#fff;padding:13px;border-radius:12px;font-weight:700;font-size:15px}
.ghost2{border:1.5px solid #ece0d4;background:#fff;color:#5a4a40;padding:13px 18px;border-radius:12px;cursor:pointer;font:inherit;font-weight:600}
.hint{font-size:12.5px;color:#a89a8c;margin-top:14px;text-align:center;line-height:1.5}
</style>
