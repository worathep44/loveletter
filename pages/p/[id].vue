<script setup lang="ts">
const route = useRoute()
const id = route.params.id as string

const { data, error } = await useFetch<any>(`/api/pages/${id}`)

// ตอบ HTTP 404 จริงเมื่อไม่พบจดหมาย (ดีต่อ SEO/แชร์) แต่ยังโชว์ UI สวยๆ ของเราเอง
if (error.value && import.meta.server) {
  setResponseStatus(useRequestEvent()!, 404)
}

// OG / share preview (สำคัญกับการแชร์ใน LINE / FB)
if (data.value) {
  const title = `ถึง ${data.value.recipient} 💌`
  const desc = (data.value.message || 'มีจดหมายรักส่งถึงคุณ...').toString().slice(0, 100)
  useHead({
    title,
    meta: [
      { property: 'og:title', content: title },
      { property: 'og:description', content: desc },
      { property: 'og:type', content: 'website' },
      { name: 'theme-color', content: '#7C2B39' },
    ],
  })
}

const opened = ref(false)
const days = ref(0)
const playing = ref(false)

const themeColors = ['t1', 't2', 't3']

function youtubeEmbed(url: string): string | null {
  if (!url) return null
  const m = url.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|shorts\/))([\w-]{11})/)
  return m ? `https://www.youtube.com/embed/${m[1]}?autoplay=1&rel=0` : null
}

function open() {
  opened.value = true
  const target = data.value?.days ?? 0
  if (target > 0) {
    const step = Math.max(1, Math.ceil(target / 48))
    const timer = setInterval(() => {
      days.value += step
      if (days.value >= target) { days.value = target; clearInterval(timer) }
    }, 22)
  }
}

function playFilm(e: Event) {
  playing.value = true
  e.stopPropagation()
}

const embed = computed(() => youtubeEmbed(data.value?.videoUrl || ''))
</script>

<template>
  <div class="desk">
    <div v-if="error" class="notfound">
      <div class="nf-emoji">💌</div>
      <h1>ไม่พบจดหมายนี้</h1>
      <p>ลิงก์อาจหมดอายุ หรือถูกลบไปแล้ว</p>
    </div>

    <div v-else class="phone" :class="{ open: opened }">
      <!-- SEAL GATE -->
      <div class="gate" :class="{ open: opened }" @click="open">
        <div class="kick">a letter for you</div>
        <h1>มีจดหมาย<br>จาก <em>{{ data.sender }}</em> ถึงเธอ</h1>
        <div class="wax"><span>{{ data.sender?.charAt(0) }}</span></div>
        <div class="tap-hint">✦ แตะตราผนึกเพื่อเปิด ✦</div>
      </div>

      <!-- LETTER -->
      <div class="scroll">
        <section class="hero">
          <div class="reveal d1"><div class="kick">our story</div><div class="rule"></div></div>
          <div class="names reveal d2">
            {{ data.recipient }}<span class="amp">&amp;</span>{{ data.sender }}
          </div>
          <div v-if="data.startDate" class="subtitle reveal d3">ตั้งแต่วันที่เราเจอกัน · {{ data.startDate }}</div>
        </section>

        <div v-if="data.days !== null" class="counter reveal d4">
          <div class="lbl">เรารักกันมาแล้ว</div>
          <div class="num">{{ days.toLocaleString() }}</div>
          <div class="unit">วัน — และจะนับต่อไปเรื่อยๆ</div>
        </div>

        <div v-if="data.videoUrl" class="film reveal d5" :class="{ playing }" @click="playFilm">
          <div class="frame-tape">play me</div>
          <div class="play"><i></i></div>
          <div class="cap">กดเพื่อเปิดคลิปของเรา ▸</div>
          <iframe v-if="playing && embed" :src="embed" allow="autoplay; encrypted-media" allowfullscreen></iframe>
          <video v-else-if="playing" :src="data.videoUrl" controls autoplay playsinline></video>
        </div>

        <section v-if="data.timeline?.length">
          <div class="tl-head reveal">
            <h2>ช่วงเวลาของเรา</h2>
            <p>ทุกภาพคือหนึ่งวันที่ฉันไม่อยากลืม</p>
          </div>
          <div class="timeline">
            <div v-for="(b, i) in data.timeline" :key="i" class="beat reveal">
              <div class="dot"></div>
              <div class="card">
                <div class="thumb" :class="themeColors[i % 3]"></div>
                <div v-if="b.date" class="date">{{ b.date }}</div>
                <h3>{{ b.title }}</h3>
                <p>{{ b.desc }}</p>
              </div>
            </div>
          </div>
        </section>

        <div v-if="data.message" class="message reveal">
          <div class="quote">"</div>
          <p style="white-space:pre-line">{{ data.message }}</p>
          <div class="sign">รักเธอ, {{ data.sender }}</div>
        </div>

        <div class="foot">
          <div class="heart">❤</div>
          <div class="made">made with love · loveletter.co</div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.desk{
  min-height:100dvh;display:flex;align-items:center;justify-content:center;padding:24px;
  font-family:"Sarabun","Noto Serif Thai","Hoefler Text",Georgia,serif;
  background:
    radial-gradient(120% 80% at 50% -10%, #3a2028 0%, transparent 55%),
    radial-gradient(100% 90% at 50% 120%, #2a151a 0%, transparent 60%),
    #1a1013;
}
.phone{
  position:relative;width:100%;max-width:420px;min-height:min(860px,94dvh);
  background:#FCF8F0;border-radius:34px;overflow:hidden;
  box-shadow:0 40px 90px -30px rgba(0,0,0,.7), 0 0 0 1px rgba(0,0,0,.35);
  color:#382A24;
}
.gate{
  position:absolute;inset:0;z-index:50;display:flex;flex-direction:column;
  align-items:center;justify-content:center;gap:34px;text-align:center;padding:40px;
  color:#FBF3E7;cursor:pointer;
  background:radial-gradient(130% 90% at 50% 20%, #8d3341 0%, #7C2B39 45%, #5A1E29 100%);
  transition:opacity .9s ease, transform 1.1s cubic-bezier(.7,0,.2,1);
}
.gate.open{opacity:0;transform:translateY(-18px) scale(1.04);pointer-events:none}
.gate .kick{font-family:"Didot",Georgia,serif;letter-spacing:.42em;text-transform:uppercase;font-size:11px;color:#E0C079}
.gate h1{font-weight:600;font-size:clamp(30px,9vw,40px);line-height:1.15}
.gate h1 em{font-style:normal;color:#E0C079}
.wax{--s:118px;width:var(--s);height:var(--s);border-radius:50%;display:grid;place-items:center;
  background:radial-gradient(60% 60% at 38% 32%, #d1607a 0%, #C9506A 42%, #98304a 100%);
  box-shadow:inset 0 3px 10px rgba(255,255,255,.35),inset 0 -8px 18px rgba(0,0,0,.35),0 14px 30px -8px rgba(0,0,0,.55);
  animation:beat 2.4s ease-in-out infinite;transition:transform .3s ease;position:relative}
.wax::before{content:"";position:absolute;inset:9px;border-radius:50%;border:1.5px dashed rgba(255,255,255,.4)}
.wax span{font-family:"Didot",Georgia,serif;font-size:44px;color:#fff2f5;text-transform:uppercase}
.wax:active{transform:scale(.94)}
.tap-hint{font-size:13px;letter-spacing:.12em;color:rgba(255,240,240,.72);animation:fadepulse 2.4s ease-in-out infinite}
@keyframes beat{0%,100%{transform:scale(1)}14%{transform:scale(1.09)}28%{transform:scale(1)}42%{transform:scale(1.06)}}
@keyframes fadepulse{0%,100%{opacity:.5}50%{opacity:1}}

.scroll{position:absolute;inset:0;overflow-y:auto;z-index:10}
.scroll::-webkit-scrollbar{width:0}
.reveal{opacity:0;transform:translateY(22px)}
.open .reveal{animation:rise .9s cubic-bezier(.2,.7,.2,1) forwards}
.open .d1{animation-delay:.15s}.open .d2{animation-delay:.32s}.open .d3{animation-delay:.5s}
.open .d4{animation-delay:.66s}.open .d5{animation-delay:.82s}
@keyframes rise{to{opacity:1;transform:none}}
section{padding:0 30px}
.hero{padding-top:64px;padding-bottom:40px;text-align:center;
  background:radial-gradient(90% 60% at 50% 0%, #f7e3d0 0%, transparent 70%)}
.hero .kick{font-family:"Didot",Georgia,serif;letter-spacing:.4em;text-transform:uppercase;font-size:10px;color:#C39A4B}
.rule{width:34px;height:1.5px;background:#C39A4B;margin:14px auto 22px;position:relative}
.rule::before,.rule::after{content:"";position:absolute;top:50%;width:4px;height:4px;background:#C39A4B;border-radius:50%;transform:translateY(-50%)}
.rule::before{left:-11px}.rule::after{right:-11px}
.names{font-weight:600;color:#7C2B39;font-size:clamp(38px,13vw,52px);line-height:1.02}
.amp{display:block;font-family:"Didot",Georgia,serif;font-style:italic;color:#C39A4B;font-size:26px;font-weight:400;margin:2px 0}
.subtitle{margin-top:16px;color:#6B564C;font-size:15px}
.counter{margin:30px 30px 4px;background:linear-gradient(160deg,#fff,#fbeede);border:1px solid rgba(195,154,75,.35);
  border-radius:20px;padding:22px;text-align:center;box-shadow:0 18px 40px -26px rgba(124,43,57,.5)}
.counter .lbl{font-size:12px;letter-spacing:.14em;color:#C39A4B;text-transform:uppercase}
.counter .num{font-family:"Didot",Georgia,serif;font-size:64px;font-weight:700;color:#7C2B39;line-height:1;margin:8px 0 4px;font-variant-numeric:tabular-nums}
.counter .unit{color:#6B564C;font-size:14px}
.film{margin:34px 30px;border-radius:18px;overflow:hidden;position:relative;aspect-ratio:9/12;cursor:pointer;
  background:linear-gradient(200deg,#2a1520,#6b2432 50%,#38202a);box-shadow:0 24px 50px -24px rgba(0,0,0,.6);border:1px solid rgba(255,255,255,.08)}
.film .frame-tape{position:absolute;top:12px;left:50%;transform:translateX(-50%) rotate(-2deg);background:rgba(251,243,231,.85);
  color:#7C2B39;font-family:"Didot",Georgia,serif;font-size:10px;letter-spacing:.24em;text-transform:uppercase;padding:5px 16px;border-radius:2px}
.film .play{position:absolute;inset:0;display:grid;place-items:center}
.film .play i{width:70px;height:70px;border-radius:50%;background:rgba(251,243,231,.16);border:1.5px solid rgba(251,243,231,.7);display:grid;place-items:center;transition:transform .3s}
.film:hover .play i{transform:scale(1.08)}
.film .play i::after{content:"";border-left:20px solid #FBF3E7;border-top:12px solid transparent;border-bottom:12px solid transparent;margin-left:5px}
.film .cap{position:absolute;bottom:16px;left:0;right:0;text-align:center;color:rgba(251,243,231,.9);font-size:13px}
.film iframe,.film video{position:absolute;inset:0;width:100%;height:100%;border:0;object-fit:cover;background:#000}
.film.playing .play,.film.playing .frame-tape,.film.playing .cap{display:none}
.tl-head{text-align:center;margin-top:14px}
.tl-head h2{font-weight:600;color:#7C2B39;font-size:24px}
.tl-head p{color:#6B564C;font-size:14px;margin-top:6px}
.timeline{margin:26px 0 10px;position:relative;padding-left:8px}
.timeline::before{content:"";position:absolute;left:36px;top:8px;bottom:8px;width:2px;background:linear-gradient(#E0C079,rgba(195,154,75,.2))}
.beat{display:flex;gap:20px;margin-bottom:26px;position:relative}
.beat .dot{flex:none;width:14px;height:14px;border-radius:50%;margin-top:5px;margin-left:22px;background:#C9506A;box-shadow:0 0 0 4px #fbeede,0 0 0 5px rgba(195,154,75,.4)}
.beat .card{flex:1}
.beat .thumb{width:100%;aspect-ratio:16/10;border-radius:12px;margin-bottom:10px;box-shadow:0 10px 26px -14px rgba(0,0,0,.5)}
.t1{background:linear-gradient(135deg,#f4c9b0,#d98a86)}
.t2{background:linear-gradient(135deg,#cdb2d8,#9a7bb0)}
.t3{background:linear-gradient(135deg,#f3d79a,#d99e6a)}
.beat .date{font-family:"Didot",Georgia,serif;font-size:11px;letter-spacing:.18em;text-transform:uppercase;color:#C39A4B}
.beat h3{font-weight:600;color:#382A24;font-size:17px;margin:2px 0 4px}
.beat p{color:#6B564C;font-size:14px;line-height:1.55}
.message{margin:20px 22px 0;padding:34px 26px;text-align:center;background:linear-gradient(#fffdf8,#fbf1df);border-radius:20px;border:1px solid rgba(195,154,75,.3)}
.message .quote{font-family:"Didot",Georgia,serif;font-size:70px;color:#E0C079;line-height:.5;height:34px;font-style:italic}
.message p{color:#382A24;font-size:17px;line-height:1.85;font-weight:500}
.sign{margin-top:22px;font-family:"Snell Roundhand","Brush Script MT",cursive;font-size:34px;color:#7C2B39;transform:rotate(-3deg)}
.foot{padding:40px 30px 54px;text-align:center}
.foot .heart{font-size:22px;color:#C9506A;animation:beat 2.4s ease-in-out infinite}
.foot .made{margin-top:18px;font-family:"Didot",Georgia,serif;font-size:10px;letter-spacing:.28em;text-transform:uppercase;color:#C39A4B;opacity:.8}

.notfound{text-align:center;color:#FBF3E7}
.nf-emoji{font-size:54px;margin-bottom:16px}
.notfound h1{font-size:26px;font-weight:600}
.notfound p{color:rgba(251,243,231,.6);margin-top:8px}

@media (prefers-reduced-motion:reduce){*{animation:none!important}.reveal{opacity:1;transform:none}}
</style>
