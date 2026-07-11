<script setup lang="ts">
// ชั้น OSD ของกล้องแคมคอร์เดอร์/VHS — REC, timestamp, scanline, grain (เฉพาะธีม vhs)
defineProps<{ stamp?: string }>()
</script>

<template>
  <div class="vhs" aria-hidden="true">
    <div class="grain"></div>
    <div class="scan"></div>
    <div class="sweep"></div>
    <div class="vig"></div>

    <div class="osd tl"><span class="dot">●</span> REC</div>
    <div class="osd tr">SP&nbsp;&nbsp;<span class="bat"><i></i><i></i><i></i></span></div>
    <div class="osd bl">{{ stamp || 'PLAY' }}</div>
    <div class="osd br">▶&nbsp;PLAY</div>

    <b class="ck c-tl"></b><b class="ck c-tr"></b><b class="ck c-bl"></b><b class="ck c-br"></b>
  </div>
</template>

<style scoped>
.vhs{position:absolute;inset:0;pointer-events:none;z-index:60;overflow:hidden;
  font-family:"VT323","Courier New",monospace;color:#5cff8e}
/* เส้นสแกน */
.scan{position:absolute;inset:0;
  background:repeating-linear-gradient(rgba(0,0,0,.32) 0 1px, transparent 1px 3px);
  opacity:.55;mix-blend-mode:multiply}
/* แถบกวาดสว่างวิ่งลง */
.sweep{position:absolute;left:0;right:0;height:80px;top:-80px;
  background:linear-gradient(transparent,rgba(92,255,142,.07) 40%,rgba(255,255,255,.05) 50%,transparent);
  animation:roll 6.5s linear infinite}
@keyframes roll{to{top:100%}}
/* ฟิล์มเกรน */
.grain{position:absolute;inset:-50%;opacity:.05;mix-blend-mode:overlay;
  background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='120'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
  animation:grainmove .6s steps(3) infinite}
@keyframes grainmove{0%{transform:translate(0,0)}33%{transform:translate(-4%,3%)}66%{transform:translate(3%,-3%)}}
/* ขอบมืด */
.vig{position:absolute;inset:0;background:radial-gradient(115% 90% at 50% 50%, transparent 55%, rgba(0,0,0,.55) 100%)}

.osd{position:absolute;font-size:21px;letter-spacing:.06em;text-shadow:0 0 8px rgba(92,255,142,.6);line-height:1}
.osd.tl{top:16px;left:16px}
.osd.tr{top:16px;right:16px;display:flex;align-items:center}
.osd.bl{bottom:16px;left:16px;color:#ffce54;text-shadow:0 0 8px rgba(255,206,84,.6)}
.osd.br{bottom:16px;right:16px}
.dot{color:#ff4d4d;text-shadow:0 0 10px rgba(255,77,77,.9);animation:blink 1.1s steps(1) infinite}
@keyframes blink{50%{opacity:0}}
.bat{display:inline-flex;gap:2px;margin-left:6px;padding:2px;border:1.5px solid #5cff8e;border-radius:2px}
.bat i{width:5px;height:10px;background:#5cff8e;display:block}

/* วงเล็บมุมจอ (viewfinder) */
.ck{position:absolute;width:22px;height:22px;border:2px solid rgba(92,255,142,.7)}
.c-tl{top:12px;left:12px;border-right:0;border-bottom:0}
.c-tr{top:12px;right:12px;border-left:0;border-bottom:0}
.c-bl{bottom:12px;left:12px;border-right:0;border-top:0}
.c-br{bottom:12px;right:12px;border-left:0;border-top:0}

@media (prefers-reduced-motion:reduce){.sweep,.grain,.dot{animation:none}}
</style>
