<script setup lang="ts">
// ธีม Galaxy — launch (จรวดพุ่ง) → กาแล็กซีอวกาศ 3D (Three.js) รูปเป็นดาว กดเปิดความทรงจำ
const props = defineProps<{ data: any }>()

type Memory = { photo: string; title?: string; desc?: string }

// รูปทั้งหมด (hero + อัลบั้ม + ไทม์ไลน์) พร้อมแคปชัน — ตัดซ้ำ
const memories = computed<Memory[]>(() => {
  const seen = new Set<string>()
  const out: Memory[] = []
  const push = (photo: string, title = '', desc = '') => {
    if (!photo || seen.has(photo)) return
    seen.add(photo); out.push({ photo, title, desc })
  }
  if (props.data?.heroPhoto) push(props.data.heroPhoto)
  ;(props.data?.photos || []).forEach((p: string) => push(p))
  ;(props.data?.timeline || []).forEach((b: any) => { if (b?.photo) push(b.photo, b.title, b.desc) })
  return out
})
const photoUrls = computed(() => memories.value.map(m => m.photo))

// คำลอยในอวกาศ — ชื่อคู่ + วลีหวานๆ
const words = computed(() => {
  const w = [props.data?.recipient, props.data?.sender, 'Happy Anniversary',
    'LOVE U', 'OUR LOVE', 'ALWAYS', 'FOREVER', 'MY ♥']
  return [...new Set(w.filter(Boolean))].slice(0, 9)
})

const coupleLine = computed(() => {
  const r = props.data?.recipient || '', s = props.data?.sender || ''
  return r && s ? `${r} & ${s}` : r || s
})

const phase = ref<'launch' | 'galaxy'>('launch')
const launching = ref(false)
const active = ref<number | null>(null)

function launch() {
  if (launching.value) return
  launching.value = true
  setTimeout(() => { phase.value = 'galaxy' }, 1500)
}
function onOpen(i: number) { active.value = i }
function closeStar() { active.value = null }
</script>

<template>
  <div class="galaxy">
    <!-- 1) LAUNCH -->
    <div v-if="phase === 'launch'" class="launch" :class="{ go: launching }" @click="launch">
      <div class="sky-static">
        <span v-for="i in 60" :key="i" class="s"
          :style="{ left: (i * 37 % 100) + '%', top: (i * 61 % 100) + '%', animationDelay: (i % 9) / 3 + 's' }" />
      </div>
      <div class="kick">a universe of us</div>
      <h1>โลกทั้งใบ<br>ของ <em>{{ data.sender }}</em> กับ <em>{{ data.recipient }}</em></h1>
      <div class="rocket">🚀</div>
      <div class="hint">แตะเพื่อออกเดินทาง ✦</div>
    </div>

    <!-- 2) GALAXY (WebGL) -->
    <template v-else>
      <ClientOnly>
        <GalaxyThree :photos="photoUrls" :words="words" @open="onOpen" />
        <template #fallback>
          <div class="loading">✦ กำลังเข้าสู่กาแล็กซี... ✦</div>
        </template>
      </ClientOnly>

      <!-- ป้ายชื่อ + คำอวยพร -->
      <div class="title">
        <div class="tk">✦ Happy Anniversary ✦</div>
        <div class="tname">{{ coupleLine }}</div>
        <div v-if="data.startDate" class="tdate">since {{ data.startDate }}</div>
      </div>
      <div class="ghint">
        {{ photoUrls.length ? 'แตะรูปดาวเพื่อเปิดความทรงจำ · ลากเพื่อหมุนกาแล็กซี' : 'ลากเพื่อหมุนกาแล็กซี ✦' }}
      </div>
    </template>

    <!-- Lightbox ความทรงจำ -->
    <transition name="fade">
      <div v-if="active !== null" class="lightbox" @click="closeStar">
        <div class="mem" @click.stop>
          <img :src="memories[active].photo" alt="" />
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
  background:radial-gradient(120% 90% at 50% 20%, #1a1038 0%, #0a0620 45%, #04020c 100%);
}

/* ---- LAUNCH ---- */
.launch{position:absolute;inset:0;z-index:20;display:flex;flex-direction:column;
  align-items:center;justify-content:center;gap:26px;text-align:center;padding:40px;cursor:pointer;
  transition:opacity 1.2s ease}
.launch.go{opacity:0;pointer-events:none}
.sky-static{position:absolute;inset:0;z-index:-1}
.sky-static .s{position:absolute;width:2px;height:2px;border-radius:50%;background:#fff;opacity:.6;
  box-shadow:0 0 6px #fff;animation:tw 3.5s ease-in-out infinite}
@keyframes tw{0%,100%{opacity:.2}50%{opacity:1}}
.launch .kick{font-family:"Didot",Georgia,serif;letter-spacing:.42em;text-transform:uppercase;font-size:11px;color:#c9a6ff}
.launch h1{font-weight:600;font-size:clamp(28px,8vw,38px);line-height:1.25;text-shadow:0 0 30px rgba(150,110,255,.5)}
.launch h1 em{font-style:normal;color:#ffd66b}
.rocket{font-size:60px;transition:transform 1.5s cubic-bezier(.5,0,.4,1)}
.launch.go .rocket{transform:translateY(-130vh) rotate(-8deg)}
.launch .hint{font-size:14px;letter-spacing:.14em;color:rgba(230,225,255,.7);animation:pulse 2.4s ease-in-out infinite}
.launch.go .kick,.launch.go h1,.launch.go .hint{opacity:0;transition:opacity .5s}
@keyframes pulse{0%,100%{opacity:.5}50%{opacity:1}}

.loading{position:absolute;inset:0;display:grid;place-items:center;color:#c9a6ff;letter-spacing:.2em;font-size:14px}

/* ---- ป้ายชื่อ ---- */
.title{position:absolute;top:6%;left:0;right:0;z-index:10;text-align:center;pointer-events:none;
  animation:fadein 1.4s ease .4s both}
.title .tk{font-family:"Didot","Cormorant Garamond",Georgia,serif;font-size:clamp(20px,6vw,30px);
  color:#fff;text-shadow:0 0 26px rgba(255,180,220,.7);letter-spacing:.04em}
.title .tname{margin-top:6px;font-size:17px;color:#ffd66b;letter-spacing:.06em}
.title .tdate{font-size:12.5px;color:rgba(230,225,255,.6);font-style:italic;margin-top:2px}
.ghint{position:absolute;bottom:26px;left:0;right:0;z-index:10;text-align:center;pointer-events:none;
  font-size:12.5px;letter-spacing:.08em;color:rgba(230,225,255,.6);padding:0 24px;
  animation:fadein 1.4s ease 1s both}
@keyframes fadein{from{opacity:0}to{opacity:1}}

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

@media (prefers-reduced-motion:reduce){.s,.rocket{animation:none}}
</style>
