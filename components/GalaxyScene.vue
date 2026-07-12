<script setup lang="ts">
// ธีม Galaxy — launch → COSMIC JOURNEY (บินผ่านดาว=รูป/วิดีโอ → หัวใจ)
const props = defineProps<{ data: any }>()

type Media = { kind: 'photo' | 'video'; photo: string | null; title?: string; desc?: string; video?: VideoItem }

// รวมสื่อทั้งหมด: รูป (hero + อัลบั้ม + ไทม์ไลน์) + วิดีโอ
const media = computed<Media[]>(() => {
  const seen = new Set<string>()
  const out: Media[] = []
  const pushPhoto = (photo: string, title = '', desc = '') => {
    if (!photo || seen.has(photo)) return
    seen.add(photo); out.push({ kind: 'photo', photo, title, desc })
  }
  if (props.data?.heroPhoto) pushPhoto(props.data.heroPhoto)
  ;(props.data?.photos || []).forEach((p: string) => pushPhoto(p))
  ;(props.data?.timeline || []).forEach((b: any) => { if (b?.photo) pushPhoto(b.photo, b.title, b.desc) })
  ;(props.data?.videos || []).forEach((v: VideoItem) => out.push({ kind: 'video', photo: v.poster || null, video: v }))
  return out
})

const coupleLine = computed(() => {
  const r = props.data?.recipient || '', s = props.data?.sender || ''
  return r && s ? `${r} & ${s}` : r || s
})

const phase = ref<'launch' | 'journey'>('launch')
const launching = ref(false)
const active = ref<number | null>(null)
const finaled = ref(false)
const cur = computed(() => (active.value !== null ? media.value[active.value] : null))

function launch() {
  if (launching.value) return
  launching.value = true
  setTimeout(() => { phase.value = 'journey' }, 1500)
}
function onOpen(i: number) { active.value = i }  // แตะเพื่อดูเต็มจอ + เสียง
function closeStar() { active.value = null }
function onFinale() { finaled.value = true }
function replay() { finaled.value = false; phase.value = 'launch'; launching.value = false }
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

    <!-- 2) COSMIC JOURNEY -->
    <template v-else>
      <ClientOnly>
        <GalaxyThree
          :memories="media.map(m => ({ photo: m.photo, kind: m.kind, title: m.title, videoUrl: m.video?.url, videoSource: m.video?.source }))"
          :paused="active !== null" @memory="onOpen" @finale="onFinale" />
        <template #fallback>
          <div class="loading">✦ กำลังออกเดินทาง... ✦</div>
        </template>
      </ClientOnly>

      <div v-if="!finaled" class="ghint">
        ✦ เลื่อน / ลากขึ้น เพื่อบินต่อ{{ media.length ? ' · แตะดาวเพื่อดูใกล้ๆ' : '' }}
      </div>

      <!-- FINALE -->
      <transition name="rise">
        <div v-if="finaled" class="finale">
          <div class="fk">✦ ✦ ✦</div>
          <h2>Happy Anniversary</h2>
          <div class="fname">{{ coupleLine }}</div>
          <div v-if="data.startDate" class="fdate">since {{ data.startDate }}</div>
          <p v-if="data.message" class="fmsg">{{ data.message }}</p>

          <div v-if="media.length" class="fgallery">
            <div class="fg-label">✦ ความทรงจำทั้งหมดของเรา ✦</div>
            <div class="fg-grid" :class="{ solo: media.length === 1 }">
              <button v-for="(m, i) in media" :key="i" class="fg"
                :style="{ animationDelay: 0.5 + i * 0.07 + 's' }" @click="onOpen(i)">
                <video v-if="m.kind === 'video' && m.video?.source === 'file'"
                  :src="m.video.url" autoplay muted playsinline></video>
                <img v-else-if="m.photo" :src="m.photo" alt="" loading="lazy" />
                <div v-else class="fg-blank">🎬</div>
                <span v-if="m.kind === 'video' && m.video?.source !== 'file'" class="fg-play">▶</span>
              </button>
            </div>
          </div>

          <button class="replay" @click="replay">✦ ออกเดินทางอีกครั้ง</button>
        </div>
      </transition>
    </template>

    <!-- Lightbox -->
    <transition name="fade">
      <div v-if="cur" class="lightbox" @click="closeStar">
        <div class="mem" :class="{ video: cur.kind === 'video' }" @click.stop>
          <div v-if="cur.kind === 'video'" class="vplayer">
            <iframe v-if="cur.video && cur.video.source !== 'file'" :src="embedUrl(cur.video)"
              allow="autoplay; encrypted-media; fullscreen" allowfullscreen></iframe>
            <video v-else-if="cur.video" :src="cur.video.url" controls autoplay playsinline></video>
          </div>
          <img v-else :src="cur.photo!" alt="" />
          <div v-if="cur.title || cur.desc" class="mem-txt">
            <h3 v-if="cur.title">{{ cur.title }}</h3>
            <p v-if="cur.desc">{{ cur.desc }}</p>
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
  background:radial-gradient(120% 90% at 50% 30%, #140a26 0%, #0a0618 45%, #04020c 100%);
}
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
.ghint{position:absolute;bottom:26px;left:0;right:0;z-index:10;text-align:center;pointer-events:none;
  font-size:12.5px;letter-spacing:.06em;color:rgba(230,225,255,.6);padding:0 24px;animation:fadein 1.6s ease 1.2s both}
@keyframes fadein{from{opacity:0}to{opacity:1}}

.finale{position:absolute;inset:0;z-index:15;overflow-y:auto;-webkit-overflow-scrolling:touch;
  display:flex;flex-direction:column;align-items:center;text-align:center;padding:15vh 24px 8vh;
  background:linear-gradient(rgba(8,4,20,0) 0%, rgba(8,4,20,.34) 20%, rgba(8,4,20,.8) 46%, rgba(8,4,20,.9) 100%)}
.finale .fk{color:#ffd66b;letter-spacing:.5em;font-size:12px;margin-bottom:10px}
.finale h2{font-family:"Didot","Cormorant Garamond",Georgia,serif;font-weight:600;font-size:clamp(30px,9vw,44px);
  color:#fff;text-shadow:0 0 34px rgba(255,180,220,.8);letter-spacing:.02em}
.finale .fname{margin-top:8px;font-size:19px;color:#ffd66b;letter-spacing:.06em}
.finale .fdate{font-size:13px;color:rgba(230,225,255,.6);font-style:italic;margin-top:3px}
.finale .fmsg{margin:16px auto 0;max-width:340px;font-size:15px;line-height:1.8;color:#e6e2ff;white-space:pre-line}
.fgallery{margin-top:30px;width:100%;max-width:430px}
.fg-label{font-size:12px;letter-spacing:.16em;color:#c9a6ff;margin-bottom:14px;text-transform:uppercase}
.fg-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:9px}
.fg-grid.solo{grid-template-columns:1fr;max-width:260px;margin-inline:auto}
.fg-grid.solo .fg{aspect-ratio:3/4}
.fg{position:relative;padding:0;border:1.5px solid rgba(255,180,220,.4);background:#160c30;cursor:pointer;aspect-ratio:1;
  border-radius:12px;overflow:hidden;box-shadow:0 0 18px -3px rgba(255,140,210,.55);
  opacity:0;transform:translateY(16px) scale(.9);animation:fgin .7s cubic-bezier(.2,.7,.2,1) forwards;transition:transform .15s}
.fg img,.fg video{width:100%;height:100%;object-fit:cover;display:block}
.fg-blank{width:100%;height:100%;display:grid;place-items:center;font-size:26px;background:linear-gradient(140deg,#3a1a5c,#160c30)}
.fg-play{position:absolute;inset:0;margin:auto;width:26px;height:26px;display:grid;place-items:center;
  background:rgba(0,0,0,.55);border-radius:50%;color:#fff;font-size:11px;padding-left:2px}
.fg:hover{transform:scale(1.05)}
@keyframes fgin{to{opacity:1;transform:none}}
.finale .replay{margin-top:26px;font:inherit;font-size:13px;color:rgba(230,225,255,.8);
  background:rgba(255,255,255,.06);border:1px solid rgba(255,255,255,.28);padding:10px 20px;border-radius:20px;cursor:pointer}
.rise-enter-active{transition:opacity 1.4s ease}
.rise-enter-from{opacity:0}

.lightbox{position:fixed;inset:0;z-index:60;display:grid;place-items:center;padding:26px;
  background:rgba(6,3,18,.82);backdrop-filter:blur(6px)}
.mem{position:relative;max-width:340px;width:100%;background:#140c2e;border:1px solid rgba(180,140,255,.35);
  border-radius:18px;overflow:hidden;box-shadow:0 30px 70px -20px rgba(0,0,0,.8),0 0 40px rgba(150,110,255,.3)}
.mem.video{max-width:420px}
.mem img{width:100%;max-height:60vh;object-fit:cover;display:block}
.vplayer{position:relative;width:100%;aspect-ratio:9/16;background:#000;max-height:74vh}
.vplayer iframe,.vplayer video{position:absolute;inset:0;width:100%;height:100%;border:0;object-fit:contain;background:#000}
.unmute{position:absolute;bottom:14px;left:50%;transform:translateX(-50%);z-index:3;font:inherit;font-size:13px;font-weight:600;
  color:#fff;background:rgba(0,0,0,.62);border:1px solid rgba(255,255,255,.32);padding:8px 16px;border-radius:20px;cursor:pointer;backdrop-filter:blur(4px)}
.mem-txt{padding:16px 18px 20px}
.mem-txt h3{font-size:18px;font-weight:600;color:#ffd66b}
.mem-txt p{font-size:14px;line-height:1.7;color:#d8d2f5;margin-top:5px}
.mem-x{position:absolute;top:10px;right:10px;width:30px;height:30px;border:none;border-radius:50%;
  background:rgba(0,0,0,.5);color:#fff;font-size:14px;cursor:pointer;z-index:2}
.fade-enter-active,.fade-leave-active{transition:opacity .3s}
.fade-enter-from,.fade-leave-to{opacity:0}

@media (prefers-reduced-motion:reduce){.s,.rocket{animation:none}}
</style>
