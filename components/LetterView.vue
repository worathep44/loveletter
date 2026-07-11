<script setup lang="ts">
// หน้าจดหมายรัก — ใช้ทั้งหน้าจริง (/p/:id) และหน้าพรีวิว (/preview)
// หน้าตาทั้งหมดขับด้วย CSS variables ต่อธีม → เปลี่ยน look ได้โดยไม่แตะ markup
const props = defineProps<{ data: any }>()

const theme = computed(() => props.data?.theme || 'classic')
const isCutie = computed(() => theme.value === 'cutie')

// ฟอนต์ลายมือน่ารักเฉพาะธีมคิวตี้ (โหลดจาก Google Fonts เมื่อจำเป็น)
if (theme.value === 'cutie') {
  useHead({
    link: [
      { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
      { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: '' },
      { rel: 'stylesheet', href: 'https://fonts.googleapis.com/css2?family=Itim&family=Mali:wght@500;600&display=swap' },
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
  const target = props.data?.days ?? 0
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

const embed = computed(() => youtubeEmbed(props.data?.videoUrl || ''))
</script>

<template>
  <div class="desk" :class="'theme-' + theme">
    <div class="phone" :class="{ open: opened }">
      <!-- SEAL GATE -->
      <div class="gate" :class="{ open: opened }" @click="open">
        <div class="kick">a letter for you</div>
        <h1>มีจดหมาย<br>จาก <em>{{ data.sender }}</em> ถึงเธอ</h1>
        <div class="wax"><span>{{ data.sender?.charAt(0) }}</span></div>
        <div class="tap-hint">✦ แตะตราผนึกเพื่อเปิด ✦</div>
      </div>

      <!-- ชั้นหัวใจ/ประกายลอย (เฉพาะคิวตี้) -->
      <CutieDeco v-if="isCutie && opened" />

      <!-- LETTER -->
      <div class="scroll">
        <section class="hero">
          <div class="reveal d1"><div class="kick">our story</div><div class="rule"></div></div>
          <div class="names reveal d2">
            {{ data.recipient }}<span class="amp">&amp;</span>{{ data.sender }}
          </div>
          <div v-if="data.startDate" class="subtitle reveal d3">ตั้งแต่วันที่เราเจอกัน · {{ data.startDate }}</div>
        </section>

        <!-- รูปหลัก (โพลารอยด์) — มีรูปก็โชว์รูป, ธีมคิวตี้ไม่มีรูปก็ใส่การ์ตูนให้ -->
        <div v-if="data.heroPhoto || isCutie" class="hero-photo reveal d3">
          <div class="polaroid">
            <div class="tape"></div>
            <div class="pic">
              <img v-if="data.heroPhoto" :src="data.heroPhoto" alt="" loading="lazy" />
              <CartoonArt v-else :i="0" />
            </div>
            <div class="cap">{{ data.recipient }} &amp; {{ data.sender }}</div>
          </div>
        </div>

        <div v-if="data.days !== null && data.days !== undefined" class="counter reveal d4">
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
                <div class="thumb" :class="{ framed: b.photo || isCutie }">
                  <img v-if="b.photo" :src="b.photo" alt="" loading="lazy" />
                  <CartoonArt v-else-if="isCutie" :i="i + 1" />
                  <div v-else class="thumb-grad" :class="themeColors[i % 3]"></div>
                </div>
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
/* ============ พาเลตต์ต่อธีม (CSS variables) ============ */
.theme-classic{
  --desk-1:#3a2028; --desk-2:#2a151a; --desk-3:#1a1013;
  --paper:#FCF8F0; --ink:#382A24; --ink-soft:#6B564C;
  --primary:#7C2B39; --accent:#C39A4B; --accent-2:#E0C079;
  --seal-a:#d1607a; --seal-b:#C9506A; --seal-c:#98304a; --seal-fg:#fff2f5;
  --gate-a:#8d3341; --gate-b:#7C2B39; --gate-c:#5A1E29; --gate-fg:#FBF3E7;
  --hero-glow:#f7e3d0; --card:#ffffff; --card-2:#fbeede;
  --hair:rgba(195,154,75,.32); --film-1:#2a1520; --film-2:#6b2432;
}
.theme-valentine{
  --desk-1:#4a1220; --desk-2:#2a0b13; --desk-3:#1c060c;
  --paper:#fff5f8; --ink:#3f2029; --ink-soft:#95606f;
  --primary:#e23b6d; --accent:#ef7fa3; --accent-2:#ffcf8f;
  --seal-a:#ff7a9c; --seal-b:#ff4d6d; --seal-c:#c9184a; --seal-fg:#fff0f4;
  --gate-a:#ff6b8f; --gate-b:#e23b6d; --gate-c:#a4123f; --gate-fg:#fff0f5;
  --hero-glow:#ffd9e5; --card:#ffffff; --card-2:#ffe6ee;
  --hair:rgba(226,59,109,.24); --film-1:#3a0f1e; --film-2:#8f1d3f;
}
.theme-modern{
  --desk-1:#26231f; --desk-2:#171512; --desk-3:#0e0d0b;
  --paper:#faf7f2; --ink:#211f1c; --ink-soft:#7d766c;
  --primary:#26241f; --accent:#b9895a; --accent-2:#d8a877;
  --seal-a:#c99568; --seal-b:#b9895a; --seal-c:#8a5e34; --seal-fg:#fdf7ef;
  --gate-a:#3a3630; --gate-b:#26231f; --gate-c:#14120f; --gate-fg:#f5efe6;
  --hero-glow:#efe9e0; --card:#ffffff; --card-2:#f2ece2;
  --hair:rgba(120,110,95,.24); --film-1:#201d19; --film-2:#4a4038;
}
.theme-midnight{
  --desk-1:#101838; --desk-2:#080b1c; --desk-3:#04050e;
  --paper:#141a38; --ink:#eceaf8; --ink-soft:#a7a4cc;
  --primary:#e6cf8f; --accent:#8a7bd8; --accent-2:#b9a7ff;
  --seal-a:#8a7be0; --seal-b:#6d5fc8; --seal-c:#3a2f86; --seal-fg:#f0edff;
  --gate-a:#1e2656; --gate-b:#101838; --gate-c:#06081c; --gate-fg:#ece9ff;
  --hero-glow:#232a5c; --card:#1b2248; --card-2:#151a38;
  --hair:rgba(160,150,230,.28); --film-1:#10143a; --film-2:#2a2f70;
}
.theme-sakura{
  --desk-1:#e9c6db; --desk-2:#dcb0cf; --desk-3:#cf9dc2;
  --paper:#fffafc; --ink:#5a4552; --ink-soft:#a98b9a;
  --primary:#d76e9c; --accent:#e89ab8; --accent-2:#f3c86a;
  --seal-a:#f7a8c4; --seal-b:#ef8fb0; --seal-c:#d76e9c; --seal-fg:#fff5f9;
  --gate-a:#f4a0c0; --gate-b:#e888ac; --gate-c:#cf6e94; --gate-fg:#fff5f9;
  --hero-glow:#ffdcea; --card:#ffffff; --card-2:#ffedf5;
  --hair:rgba(215,110,156,.24); --film-1:#c98fb0; --film-2:#e6a9c4;
}
.theme-cutie{
  --desk-1:#ffd6e8; --desk-2:#e0d3ff; --desk-3:#fff0f7;
  --paper:#fff6fb; --ink:#5b3a5f; --ink-soft:#9a6f92;
  --primary:#ff2e8b; --accent:#8b5cf6; --accent-2:#ff9f45;
  --seal-a:#ffb0d3; --seal-b:#ff5fa2; --seal-c:#e5568f; --seal-fg:#ffffff;
  --gate-a:#ffa6d2; --gate-b:#ff5fa2; --gate-c:#c23e86; --gate-fg:#ffffff;
  --hero-glow:#ffe0ef; --card:#ffffff; --card-2:#fff0f7;
  --hair:rgba(255,94,162,.30); --film-1:#ff9ec2; --film-2:#c86fd0;
  --font-display:"Itim","Mali","Sarabun",cursive;
}

/* ============ โครง (ใช้ตัวแปรข้างบน) ============ */
.desk{
  min-height:100dvh;display:flex;align-items:center;justify-content:center;padding:24px;
  font-family:"Sarabun","Noto Serif Thai","Hoefler Text",Georgia,serif;
  background:
    radial-gradient(120% 80% at 50% -10%, var(--desk-1) 0%, transparent 55%),
    radial-gradient(100% 90% at 50% 120%, var(--desk-2) 0%, transparent 60%),
    var(--desk-3);
}
.phone{
  position:relative;width:100%;max-width:420px;min-height:min(860px,94dvh);
  background:var(--paper);border-radius:34px;overflow:hidden;
  box-shadow:0 40px 90px -30px rgba(0,0,0,.7), 0 0 0 1px rgba(0,0,0,.35);
  color:var(--ink);
}
.gate{
  position:absolute;inset:0;z-index:50;display:flex;flex-direction:column;
  align-items:center;justify-content:center;gap:34px;text-align:center;padding:40px;
  color:var(--gate-fg);cursor:pointer;
  background:radial-gradient(130% 90% at 50% 20%, var(--gate-a) 0%, var(--gate-b) 45%, var(--gate-c) 100%);
  transition:opacity .9s ease, transform 1.1s cubic-bezier(.7,0,.2,1);
}
.gate.open{opacity:0;transform:translateY(-18px) scale(1.04);pointer-events:none}
.gate .kick{font-family:"Didot",Georgia,serif;letter-spacing:.42em;text-transform:uppercase;font-size:11px;color:var(--accent-2)}
.gate h1{font-weight:600;font-size:clamp(30px,9vw,40px);line-height:1.15}
.gate h1 em{font-style:normal;color:var(--accent-2)}
.wax{--s:118px;width:var(--s);height:var(--s);border-radius:50%;display:grid;place-items:center;
  background:radial-gradient(60% 60% at 38% 32%, var(--seal-a) 0%, var(--seal-b) 42%, var(--seal-c) 100%);
  box-shadow:inset 0 3px 10px rgba(255,255,255,.35),inset 0 -8px 18px rgba(0,0,0,.35),0 14px 30px -8px rgba(0,0,0,.55);
  animation:beat 2.4s ease-in-out infinite;transition:transform .3s ease;position:relative}
.wax::before{content:"";position:absolute;inset:9px;border-radius:50%;border:1.5px dashed rgba(255,255,255,.4)}
.wax span{font-family:"Didot",Georgia,serif;font-size:44px;color:var(--seal-fg);text-transform:uppercase}
.wax:active{transform:scale(.94)}
.tap-hint{font-size:13px;letter-spacing:.12em;color:var(--gate-fg);opacity:.72;animation:fadepulse 2.4s ease-in-out infinite}
@keyframes beat{0%,100%{transform:scale(1)}14%{transform:scale(1.09)}28%{transform:scale(1)}42%{transform:scale(1.06)}}
@keyframes fadepulse{0%,100%{opacity:.4}50%{opacity:.85}}

.scroll{position:absolute;inset:0;overflow-y:auto;z-index:10}
.scroll::-webkit-scrollbar{width:0}
.reveal{opacity:0;transform:translateY(22px)}
.open .reveal{animation:rise .9s cubic-bezier(.2,.7,.2,1) forwards}
.open .d1{animation-delay:.15s}.open .d2{animation-delay:.32s}.open .d3{animation-delay:.5s}
.open .d4{animation-delay:.66s}.open .d5{animation-delay:.82s}
@keyframes rise{to{opacity:1;transform:none}}
section{padding:0 30px}
.hero{padding-top:64px;padding-bottom:40px;text-align:center;
  background:radial-gradient(90% 60% at 50% 0%, var(--hero-glow) 0%, transparent 70%)}
.hero .kick{font-family:"Didot",Georgia,serif;letter-spacing:.4em;text-transform:uppercase;font-size:10px;color:var(--accent)}
.rule{width:34px;height:1.5px;background:var(--accent);margin:14px auto 22px;position:relative}
.rule::before,.rule::after{content:"";position:absolute;top:50%;width:4px;height:4px;background:var(--accent);border-radius:50%;transform:translateY(-50%)}
.rule::before{left:-11px}.rule::after{right:-11px}
.names{font-weight:600;color:var(--primary);font-size:clamp(38px,13vw,52px);line-height:1.02}
.amp{display:block;font-family:"Didot",Georgia,serif;font-style:italic;color:var(--accent);font-size:26px;font-weight:400;margin:2px 0}
.subtitle{margin-top:16px;color:var(--ink-soft);font-size:15px}
.counter{margin:30px 30px 4px;background:linear-gradient(160deg,var(--card),var(--card-2));border:1px solid var(--hair);
  border-radius:20px;padding:22px;text-align:center;box-shadow:0 18px 40px -26px rgba(0,0,0,.45)}
.counter .lbl{font-size:12px;letter-spacing:.14em;color:var(--accent);text-transform:uppercase}
.counter .num{font-family:"Didot",Georgia,serif;font-size:64px;font-weight:700;color:var(--primary);line-height:1;margin:8px 0 4px;font-variant-numeric:tabular-nums}
.counter .unit{color:var(--ink-soft);font-size:14px}
.film{margin:34px 30px;border-radius:18px;overflow:hidden;position:relative;aspect-ratio:9/12;cursor:pointer;
  background:linear-gradient(200deg,var(--film-1),var(--film-2) 50%,var(--film-1));box-shadow:0 24px 50px -24px rgba(0,0,0,.6);border:1px solid rgba(255,255,255,.08)}
.film .frame-tape{position:absolute;top:12px;left:50%;transform:translateX(-50%) rotate(-2deg);background:rgba(251,243,231,.85);
  color:var(--primary);font-family:"Didot",Georgia,serif;font-size:10px;letter-spacing:.24em;text-transform:uppercase;padding:5px 16px;border-radius:2px}
.film .play{position:absolute;inset:0;display:grid;place-items:center}
.film .play i{width:70px;height:70px;border-radius:50%;background:rgba(251,243,231,.16);border:1.5px solid rgba(251,243,231,.7);display:grid;place-items:center;transition:transform .3s}
.film:hover .play i{transform:scale(1.08)}
.film .play i::after{content:"";border-left:20px solid #FBF3E7;border-top:12px solid transparent;border-bottom:12px solid transparent;margin-left:5px}
.film .cap{position:absolute;bottom:16px;left:0;right:0;text-align:center;color:rgba(251,243,231,.9);font-size:13px}
.film iframe,.film video{position:absolute;inset:0;width:100%;height:100%;border:0;object-fit:cover;background:#000}
.film.playing .play,.film.playing .frame-tape,.film.playing .cap{display:none}
.tl-head{text-align:center;margin-top:14px}
.tl-head h2{font-weight:600;color:var(--primary);font-size:24px}
.tl-head p{color:var(--ink-soft);font-size:14px;margin-top:6px}
.timeline{margin:26px 0 10px;position:relative;padding-left:8px}
.timeline::before{content:"";position:absolute;left:36px;top:8px;bottom:8px;width:2px;background:linear-gradient(var(--accent-2),transparent)}
.beat{display:flex;gap:20px;margin-bottom:26px;position:relative}
.beat .dot{flex:none;width:14px;height:14px;border-radius:50%;margin-top:5px;margin-left:22px;background:var(--seal-b);box-shadow:0 0 0 4px var(--card-2),0 0 0 5px var(--hair)}
.beat .card{flex:1}
.beat .thumb{width:100%;aspect-ratio:16/10;border-radius:12px;margin-bottom:10px;overflow:hidden;box-shadow:0 10px 26px -14px rgba(0,0,0,.5)}
.beat .thumb img,.beat .thumb .art,.beat .thumb .thumb-grad{width:100%;height:100%;object-fit:cover;display:block}
.t1{background:linear-gradient(135deg,#f4c9b0,#d98a86)}
.t2{background:linear-gradient(135deg,#cdb2d8,#9a7bb0)}
.t3{background:linear-gradient(135deg,#f3d79a,#d99e6a)}
.beat .date{font-family:"Didot",Georgia,serif;font-size:11px;letter-spacing:.18em;text-transform:uppercase;color:var(--accent)}
.beat h3{font-weight:600;color:var(--ink);font-size:17px;margin:2px 0 4px}
.beat p{color:var(--ink-soft);font-size:14px;line-height:1.55}
.message{margin:20px 22px 0;padding:34px 26px;text-align:center;background:linear-gradient(var(--card),var(--card-2));border-radius:20px;border:1px solid var(--hair)}
.message .quote{font-family:"Didot",Georgia,serif;font-size:70px;color:var(--accent-2);line-height:.5;height:34px;font-style:italic}
.message p{color:var(--ink);font-size:17px;line-height:1.85;font-weight:500}
.sign{margin-top:22px;font-family:"Snell Roundhand","Brush Script MT",cursive;font-size:34px;color:var(--primary);transform:rotate(-3deg)}
.foot{padding:40px 30px 54px;text-align:center}
.foot .heart{font-size:22px;color:var(--seal-b);animation:beat 2.4s ease-in-out infinite}
.foot .made{margin-top:18px;font-family:"Didot",Georgia,serif;font-size:10px;letter-spacing:.28em;text-transform:uppercase;color:var(--accent);opacity:.8}

/* ===== รูปหลัก (โพลารอยด์ — ใช้ได้ทุกธีม) ===== */
.hero-photo{display:flex;justify-content:center;padding:8px 30px 2px}
.polaroid{position:relative;background:#fff;padding:11px 11px 0;border-radius:5px;
  box-shadow:0 16px 34px -16px rgba(0,0,0,.5);transform:rotate(-2.5deg)}
.polaroid .pic{width:min(280px,70vw);aspect-ratio:4/5;border-radius:3px;overflow:hidden;background:var(--hero-glow)}
.polaroid .pic img,.polaroid .pic :deep(.art){width:100%;height:100%;object-fit:cover;display:block}
.polaroid .cap{text-align:center;padding:9px 6px 12px;color:var(--ink-soft);font-size:15px;font-family:var(--font-display,inherit)}
.polaroid .tape{position:absolute;top:-9px;left:50%;transform:translateX(-50%) rotate(-3deg);
  width:78px;height:20px;background:rgba(160,140,120,.32);border-radius:2px}

/* ===== ธีมคิวตี้: ปรับแต่งพิเศษ ===== */
.theme-cutie{
  font-family:"Mali","Sarabun",sans-serif;
  background:
    radial-gradient(55% 45% at 12% 12%, #ffd6e8 0%, transparent 60%),
    radial-gradient(50% 42% at 88% 16%, #e2d4ff 0%, transparent 58%),
    radial-gradient(60% 50% at 50% 104%, #cbf3e2 0%, transparent 55%),
    #fff0f7 !important;
}
.theme-cutie .phone{border-radius:30px;
  box-shadow:0 40px 90px -30px rgba(200,90,150,.55),0 0 0 3px #fff,0 0 0 5px rgba(255,94,162,.22)}
.theme-cutie .gate h1,.theme-cutie .names,.theme-cutie .tl-head h2,
.theme-cutie .counter .num,.theme-cutie .sign,.theme-cutie .polaroid .cap{font-family:var(--font-display)}
.theme-cutie .gate .kick,.theme-cutie .hero .kick{font-family:var(--font-display);text-transform:none;letter-spacing:.06em;font-size:13px}
.theme-cutie .names{text-shadow:2px 2px 0 #ffe0ef}
.theme-cutie .wax{border-radius:50% 50% 48% 48%}
.theme-cutie .counter,.theme-cutie .message{border:2.5px dashed var(--hair);border-radius:26px}
.theme-cutie .counter .lbl::after{content:" 💞"}
.theme-cutie .tl-head h2::after{content:" 🌷"}
.theme-cutie .sign::after{content:" 💌"}
.theme-cutie .polaroid{animation:wiggle 4.5s ease-in-out infinite}
.theme-cutie .polaroid .tape{
  background:repeating-linear-gradient(45deg,#ffcf8f 0 7px,#ffb0d3 7px 14px);height:22px;opacity:.92}
.theme-cutie .beat .thumb{border:3px solid #fff;box-shadow:0 12px 26px -12px rgba(200,90,150,.5)}
@keyframes wiggle{0%,100%{transform:rotate(-2.5deg)}50%{transform:rotate(1.5deg)}}

@media (prefers-reduced-motion:reduce){*{animation:none!important}.reveal{opacity:1;transform:none}}
</style>
