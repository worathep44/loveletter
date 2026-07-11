<script setup lang="ts">
// คอนเฟตตี + ประกาย ตกโปรยลงมา (เฉพาะธีมของขวัญ) — CSS ล้วน
const cols = ['#ffd66b', '#ff5fa8', '#7cf5e0', '#b98cff', '#ffffff']
const pieces = Array.from({ length: 22 }, (_, i) => ({
  left: (i * 4.6 + (i % 5) * 3) % 100,
  color: cols[i % cols.length],
  delay: ((i * 7) % 40) / 10,
  dur: 4.5 + ((i * 3) % 30) / 10,
  size: 6 + (i % 4) * 2,
  round: i % 3 === 0,
}))
</script>

<template>
  <div class="cf" aria-hidden="true">
    <i
      v-for="(p, i) in pieces" :key="i"
      :style="{
        left: p.left + '%',
        background: p.color,
        animationDelay: p.delay + 's',
        animationDuration: p.dur + 's',
        width: p.size + 'px',
        height: (p.round ? p.size : p.size * 1.6) + 'px',
        borderRadius: p.round ? '50%' : '1px',
      }"
    ></i>
  </div>
</template>

<style scoped>
.cf{position:absolute;inset:0;overflow:hidden;pointer-events:none;z-index:20}
.cf i{position:absolute;top:-24px;display:block;opacity:0;
  animation-name:drop;animation-timing-function:linear;animation-iteration-count:infinite;
  filter:drop-shadow(0 1px 2px rgba(0,0,0,.25))}
@keyframes drop{
  0%{transform:translateY(0) rotate(0);opacity:0}
  10%{opacity:1}
  85%{opacity:.9}
  100%{transform:translateY(760px) rotate(540deg);opacity:0}
}
@media (prefers-reduced-motion:reduce){.cf{display:none}}
</style>
