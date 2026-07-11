<script setup lang="ts">
// ธีม Galaxy — พุ่งขึ้นอวกาศ → รูปกลายเป็นดาวลอยรอบหัวใจ → กดดาวเปิดความทรงจำ
// → รวมดาวเป็น Heart Constellation + Happy Anniversary
const props = defineProps<{ data: any }>()

type Memory = { photo: string | null; title?: string; desc?: string }

// รวมความทรงจำจากทุกแหล่ง (hero + อัลบั้ม + ไทม์ไลน์) ตัดซ้ำ
const memories = computed<Memory[]>(() => {
  const seen = new Set<string>()
  const out: Memory[] = []
  const push = (photo: string | null, title = '', desc = '') => {
    if (photo && seen.has(photo)) return
    if (photo) seen.add(photo)
    out.push({ photo, title, desc })
  }
  if (props.data?.heroPhoto) push(props.data.heroPhoto)
  ;(props.data?.photos || []).forEach((p: string) => push(p))
  ;(props.data?.timeline || []).forEach((b: any) => { if (b?.photo) push(b.photo, b.title, b.desc) })
  // ไม่มีรูปเลย (เช่นพรีวิว) → ดาวเปล่าให้กาแล็กซีไม่ว่าง
  if (!out.length) for (let i = 0; i < 9; i++) out.push({ photo: null })
  return out
})

const count = computed(() => memories.value.length)

// ---- ตำแหน่งกระจาย (ก้นหอยทองคำ) ในกรอบสี่เหลี่ยมจัตุรัสกลางจอ ----
function scatterPos(i: number) {
  const golden = 2.399963
  const a = i * golden
  const r = Math.min(46, 9 + i * 4.4)
  return { x: 50 + r * Math.cos(a), y: 50 + r * Math.sin(a) }
}

// ---- ตำแหน่งหัวใจ (สมการหัวใจ) ----
const N = computed(() => Math.max(count.value, 22))
function heartPoint(k: number, n: number) {
  const t = (k / n) * Math.PI * 2
  const hx = 16 * Math.sin(t) ** 3
  const hy = 13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t)
  return { x: 50 + hx * 2.55, y: 46 - hy * 2.4 }
}
// ดาวความทรงจำ i → จุดบนหัวใจ (กระจายทั่วเส้น)
function heartIndexOf(i: number) { return Math.round((i * N.value) / count.value) % N.value }
const memoryHeartIdx = computed(() => memories.value.map((_, i) => heartIndexOf(i)))
// จุดหัวใจที่เหลือ (ไม่มีดาวความทรงจำ) → ดาวเล็กเติมเต็ม
const fillerHeart = computed(() => {
  const used = new Set(memoryHeartIdx.value)
  const pts: { x: number; y: number }[] = []
  for (let k = 0; k < N.value; k++) if (!used.has(k)) pts.push(heartPoint(k, N.value))
  return pts
})

function starStyle(i: number) {
  const p = phase.value === 'finale'
    ? heartPoint(memoryHeartIdx.value[i], N.value)
    : scatterPos(i)
  return { left: p.x + '%', top: p.y + '%' }
}

// ---- ดาวพื้นหลัง (deterministic กัน SSR mismatch) ----
const bgStars = Array.from({ length: 76 }, (_, i) => ({
  x: (i * 37 + (i % 7) * 5) % 100,
  y: (i * 61 + (i % 5) * 7) % 100,
  s: 1 + (i % 3) * 0.7,
  d: (i % 11) / 3,
}))

// ---- สถานะ ----
const phase = ref<'launch' | 'explore' | 'finale'>('launch')
const viewed = ref<Set<number>>(new Set())
const active = ref<number | null>(null) // ดาวที่กำลังเปิด (lightbox)
const launching = ref(false)

const allViewed = computed(() =>
  memories.value.filter(m => m.photo).length > 0 &&
  memories.value.every((m, i) => !m.photo || viewed.value.has(i)),
)

function launch() {
  if (launching.value) return
  launching.value = true
  setTimeout(() => { phase.value = 'explore' }, 1500)
}
function openStar(i: number) {
  if (!memories.value[i].photo) return
  active.value = i
  viewed.value = new Set(viewed.value).add(i)
}
function closeStar() { active.value = null }
function toFinale() { active.value = null; phase.value = 'finale' }
function replay() { phase.value = 'explore' }

const coupleLine = computed(() => {
  const r = props.data?.recipient || ''
  const s = props.data?.sender || ''
  return r && s ? `${r} & ${s}` : r || s
})
</script>

<template>
  <div class="galaxy" :class="phase">
    <!-- ดาวพื้นหลัง + เนบิวลา -->
    <div class="sky">
      <span v-for="(st, i) in bgStars" :key="i" class="bgstar"
        :style="{ left: st.x + '%', top: st.y + '%', width: st.s + 'px', height: st.s + 'px', animationDelay: st.d + 's' }" />
    </div>
    <div class="neb neb1"></div>
    <div class="neb neb2"></div>

    <!-- 1) LAUNCH -->
    <div v-if="phase === 'launch'" class="launch" :class="{ go: launching }" @click="launch">
      <div class="kick">a universe of us</div>
      <h1>โลกทั้งใบ<br>ของ <em>{{ data.sender }}</em> กับ <em>{{ data.recipient }}</em></h1>
      <div class="rocket">🚀</div>
      <div class="hint">แตะเพื่อออกเดินทาง ✦</div>
      <div class="trail"></div>
    </div>

    <!-- 2) EXPLORE + 3) FINALE (ดาวชุดเดียวกัน ย้ายตำแหน่ง) -->
    <div v-else class="stagewrap">
      <div class="stage">
        <!-- หัวใจกลาง (ตอน explore) -->
        <div class="core" :class="{ hide: phase === 'finale' }">
          <div class="core-heart">♥</div>
          <div class="core-name">{{ coupleLine }}</div>
        </div>

        <!-- ดาวเติมเต็มหัวใจ (finale) -->
        <template v-if="phase === 'finale'">
          <span v-for="(f, k) in fillerHeart" :key="'f' + k"
            class="filler" :style="{ left: f.x + '%', top: f.y + '%' }" />
        </template>

        <!-- ดาวความทรงจำ -->
        <button v-for="(m, i) in memories" :key="i" class="star"
          :class="{ photo: m.photo, lit: viewed.has(i) }"
          :style="{ ...starStyle(i), transitionDelay: (i % 8) * 0.05 + 's' }"
          @click="openStar(i)">
          <img v-if="m.photo" :src="m.photo" alt="" loading="lazy" />
          <span v-else class="spark">✦</span>
          <span class="halo"></span>
        </button>
      </div>

      <!-- คำโปรย / ปุ่ม -->
      <div v-if="phase === 'explore'" class="hud">
        <div class="hud-hint">✦ แตะดวงดาวเพื่อเปิดความทรงจำ ✦</div>
        <button class="gather" :class="{ ready: allViewed }" @click="toFinale">
          รวมดาวเป็นหัวใจ ♥
        </button>
      </div>

      <!-- FINALE text -->
      <div v-if="phase === 'finale'" class="finale">
        <div class="fk">✦ ✦ ✦</div>
        <h2>Happy Anniversary</h2>
        <div class="fname">{{ coupleLine }}</div>
        <div v-if="data.startDate" class="fdate">since {{ data.startDate }}</div>
        <p v-if="data.message" class="fmsg">{{ data.message }}</p>
        <button class="replay" @click="replay">✦ ดูดาวอีกครั้ง</button>
      </div>
    </div>

    <!-- Lightbox ความทรงจำ -->
    <transition name="fade">
      <div v-if="active !== null" class="lightbox" @click="closeStar">
        <div class="mem" @click.stop>
          <img v-if="memories[active].photo" :src="memories[active].photo!" alt="" />
          <div v-if="memories[active].title || memories[active].desc" class="mem-txt">
            <h3 v-if="memories[active].title">{{ memories[active].title }}</h3>
            <p v-if="memories[active].desc">{{ memories[active].desc }}</p>
          </div>
          <button class="mem-x" @click="closeStar">✕</button>
        </div>
      </div>
    </transition>
  </div>
</template>

<style scoped>
.galaxy{
  position:relative;min-height:100dvh;overflow:hidden;
  font-family:"Sarabun","Noto Serif Thai",Georgia,serif;color:#eae7ff;
  background:radial-gradient(120% 90% at 50% 10%, #241748 0%, #0d0722 45%, #05030f 100%);
}
/* ---- ดาวพื้นหลัง + เนบิวลา ---- */
.sky{position:absolute;inset:0;z-index:1}
.bgstar{position:absolute;border-radius:50%;background:#fff;opacity:.7;
  box-shadow:0 0 6px rgba(255,255,255,.8);animation:tw 3.5s ease-in-out infinite}
@keyframes tw{0%,100%{opacity:.25;transform:scale(.8)}50%{opacity:1;transform:scale(1.15)}}
.neb{position:absolute;border-radius:50%;filter:blur(60px);opacity:.5;z-index:0;pointer-events:none}
.neb1{width:70%;aspect-ratio:1;left:-15%;top:-10%;background:radial-gradient(circle,#7b3ff2,transparent 65%)}
.neb2{width:75%;aspect-ratio:1;right:-20%;bottom:-15%;background:radial-gradient(circle,#e0457b,transparent 65%)}

/* ---- 1) LAUNCH ---- */
.launch{position:absolute;inset:0;z-index:20;display:flex;flex-direction:column;
  align-items:center;justify-content:center;gap:26px;text-align:center;padding:40px;cursor:pointer;
  transition:opacity 1.2s ease}
.launch.go{opacity:0;pointer-events:none}
.launch .kick{font-family:"Didot",Georgia,serif;letter-spacing:.42em;text-transform:uppercase;font-size:11px;color:#c9a6ff}
.launch h1{font-weight:600;font-size:clamp(28px,8vw,38px);line-height:1.25;text-shadow:0 0 30px rgba(150,110,255,.5)}
.launch h1 em{font-style:normal;color:#ffd66b}
.rocket{font-size:60px;transition:transform 1.5s cubic-bezier(.5,0,.4,1)}
.launch.go .rocket{transform:translateY(-130vh) rotate(-8deg)}
.launch .hint{font-size:14px;letter-spacing:.14em;color:rgba(230,225,255,.7);animation:pulse 2.4s ease-in-out infinite}
.launch.go .hint,.launch.go .kick,.launch.go h1{opacity:0;transition:opacity .5s}
@keyframes pulse{0%,100%{opacity:.5}50%{opacity:1}}

/* ---- STAGE (สี่เหลี่ยมจัตุรัสกลางจอ ให้หัวใจไม่บิด) ---- */
.stagewrap{position:absolute;inset:0;z-index:10;display:flex;flex-direction:column;
  align-items:center;justify-content:center}
.stage{position:relative;width:min(92vw,400px);aspect-ratio:1}
.core{position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);text-align:center;
  transition:opacity .6s ease,transform .6s ease;z-index:2}
.core.hide{opacity:0;transform:translate(-50%,-50%) scale(.5)}
.core-heart{font-size:46px;color:#ff5f9e;text-shadow:0 0 26px rgba(255,95,158,.8);animation:beat 2.6s ease-in-out infinite}
.core-name{margin-top:6px;font-size:15px;letter-spacing:.1em;color:#ffd66b}
@keyframes beat{0%,100%{transform:scale(1)}15%{transform:scale(1.14)}30%{transform:scale(1)}45%{transform:scale(1.08)}}

.star{position:absolute;transform:translate(-50%,-50%);width:52px;height:52px;padding:0;border:none;
  background:none;cursor:pointer;transition:left 1.2s cubic-bezier(.6,0,.2,1),top 1.2s cubic-bezier(.6,0,.2,1);
  animation:drift 6s ease-in-out infinite}
.star img{width:100%;height:100%;object-fit:cover;border-radius:50%;
  border:2px solid rgba(255,255,255,.8);box-shadow:0 0 16px rgba(160,120,255,.7),0 6px 16px rgba(0,0,0,.5)}
.star .spark{font-size:20px;color:#fff;text-shadow:0 0 12px rgba(200,170,255,.9);display:grid;place-items:center;width:100%;height:100%}
.star .halo{position:absolute;inset:-6px;border-radius:50%;pointer-events:none;
  box-shadow:0 0 22px 4px rgba(180,140,255,.35);opacity:.7}
.star.photo:hover{z-index:5}
.star.photo:hover img{transform:scale(1.12);box-shadow:0 0 26px rgba(255,180,120,.9)}
.star.lit img{border-color:#ffd66b}
.finale .star{width:34px;height:34px;animation:none}
.finale .star .halo{box-shadow:0 0 16px 3px rgba(255,150,200,.5)}
@keyframes drift{0%,100%{margin-top:0}50%{margin-top:-7px}}
.finale .star{margin-top:0}

.filler{position:absolute;transform:translate(-50%,-50%);width:7px;height:7px;border-radius:50%;
  background:#fff;box-shadow:0 0 10px 2px rgba(255,180,220,.9);opacity:0;animation:pop .5s ease forwards}
@keyframes pop{to{opacity:.9}}

/* ---- HUD ---- */
.hud{position:absolute;bottom:34px;left:0;right:0;z-index:15;text-align:center;padding:0 20px}
.hud-hint{font-size:13.5px;letter-spacing:.1em;color:rgba(230,225,255,.75);margin-bottom:14px;animation:pulse 3s ease-in-out infinite}
.gather{font:inherit;font-size:15px;font-weight:600;color:#eae7ff;cursor:pointer;
  padding:12px 26px;border-radius:30px;border:1.5px solid rgba(255,214,107,.5);
  background:rgba(255,214,107,.08);backdrop-filter:blur(6px);transition:.2s}
.gather:hover{background:rgba(255,214,107,.18)}
.gather.ready{border-color:#ffd66b;background:rgba(255,214,107,.22);
  box-shadow:0 0 24px rgba(255,214,107,.4);animation:pulse 2s ease-in-out infinite}

/* ---- FINALE text ---- */
.finale{position:absolute;bottom:5%;left:0;right:0;z-index:15;text-align:center;padding:0 26px;
  animation:rise 1.2s ease .6s both}
.finale .fk{color:#ffd66b;letter-spacing:.5em;font-size:12px;margin-bottom:10px}
.finale h2{font-family:"Didot","Cormorant Garamond",Georgia,serif;font-weight:600;font-size:clamp(30px,9vw,42px);
  color:#fff;text-shadow:0 0 30px rgba(255,180,220,.7);letter-spacing:.02em}
.finale .fname{margin-top:8px;font-size:18px;color:#ffd66b;letter-spacing:.06em}
.finale .fdate{font-size:13px;color:rgba(230,225,255,.6);margin-top:4px;font-style:italic}
.finale .fmsg{margin:16px auto 0;max-width:340px;font-size:15px;line-height:1.8;color:#e6e2ff;white-space:pre-line}
.finale .replay{margin-top:22px;font:inherit;font-size:13px;color:rgba(230,225,255,.7);
  background:none;border:1px solid rgba(255,255,255,.25);padding:9px 18px;border-radius:20px;cursor:pointer}
@keyframes rise{from{opacity:0;transform:translateY(24px)}to{opacity:1;transform:none}}

/* ---- Lightbox ---- */
.lightbox{position:fixed;inset:0;z-index:60;display:grid;place-items:center;padding:26px;
  background:rgba(6,3,18,.82);backdrop-filter:blur(6px)}
.mem{position:relative;max-width:340px;width:100%;background:#140c2e;border:1px solid rgba(180,140,255,.35);
  border-radius:18px;overflow:hidden;box-shadow:0 30px 70px -20px rgba(0,0,0,.8),0 0 40px rgba(150,110,255,.3)}
.mem img{width:100%;max-height:60vh;object-fit:cover;display:block}
.mem-txt{padding:16px 18px 20px}
.mem-txt h3{font-size:18px;font-weight:600;color:#ffd66b}
.mem-txt p{font-size:14px;line-height:1.7;color:#d8d2f5;margin-top:5px}
.mem-x{position:absolute;top:10px;right:10px;width:30px;height:30px;border:none;border-radius:50%;
  background:rgba(0,0,0,.5);color:#fff;font-size:14px;cursor:pointer}
.fade-enter-active,.fade-leave-active{transition:opacity .3s}
.fade-enter-from,.fade-leave-to{opacity:0}

@media (prefers-reduced-motion:reduce){.bgstar,.star,.core-heart,.gather{animation:none}}
</style>
