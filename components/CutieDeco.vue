<script setup lang="ts">
// ชั้นตกแต่งลอยของธีมคิวตี้ — หัวใจ/ดาว/ประกาย ลอยขึ้นเรื่อยๆ (CSS ล้วน)
const bits = [
  { e: '💗', l: 8, d: 0, s: 20 }, { e: '⭐', l: 24, d: 2.4, s: 15 },
  { e: '💕', l: 42, d: 1.1, s: 22 }, { e: '✨', l: 60, d: 3.2, s: 16 },
  { e: '🎀', l: 78, d: 0.6, s: 19 }, { e: '💖', l: 90, d: 2.0, s: 21 },
  { e: '🌸', l: 15, d: 4.1, s: 17 }, { e: '⭐', l: 68, d: 5.0, s: 14 },
  { e: '✨', l: 34, d: 6.2, s: 15 }, { e: '💗', l: 52, d: 5.6, s: 18 },
]
</script>

<template>
  <div class="deco" aria-hidden="true">
    <span
      v-for="(b, i) in bits" :key="i" class="bit"
      :style="{ left: b.l + '%', animationDelay: b.d + 's', fontSize: b.s + 'px' }"
    >{{ b.e }}</span>
  </div>
</template>

<style scoped>
.deco{position:absolute;inset:0;overflow:hidden;pointer-events:none;z-index:5}
.bit{position:absolute;bottom:-30px;opacity:0;animation:float 9s linear infinite;filter:drop-shadow(0 2px 3px rgba(180,80,130,.25))}
@keyframes float{
  0%{transform:translateY(0) rotate(0);opacity:0}
  12%{opacity:.9}
  85%{opacity:.7}
  100%{transform:translateY(-108%) rotate(28deg);opacity:0}
}
@media (prefers-reduced-motion:reduce){.bit{display:none}}
</style>
