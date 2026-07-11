<script setup lang="ts">
// วงล้อรูปหมุน 3D — เอารูปที่อัปโหลด (hero + ทุกช่วง) มาหมุนโชว์รอบวง
// ถ้ารูปน้อย เติมการ์ดประกายให้ครบวงจะได้ดูเต็ม
const props = defineProps<{ photos: string[] }>()

const display = computed(() => {
  const p = (props.photos || []).filter(Boolean).slice(0, 12)
  const out: (string | null)[] = [...p]
  const min = 6
  while (out.length < min) out.push(null)
  return out
})
const count = computed(() => display.value.length)
const radius = computed(() => Math.round(Math.max(150, 82 / Math.tan(Math.PI / count.value))))
function cellStyle(i: number) {
  return { transform: `rotateY(${(i * 360) / count.value}deg) translateZ(${radius.value}px)` }
}
const grad = ['g0', 'g1', 'g2']
</script>

<template>
  <div class="stage" :style="{ '--r': radius + 'px' }">
    <div class="ring">
      <div v-for="(src, i) in display" :key="i" class="cell" :style="cellStyle(i)">
        <div class="card">
          <img v-if="src" :src="src" alt="" loading="lazy" />
          <div v-else class="ph" :class="grad[i % 3]"><span>✦</span></div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.stage{height:270px;margin:8px 0 6px;perspective:1000px;display:flex;align-items:center;justify-content:center}
.ring{position:relative;width:150px;height:196px;transform-style:preserve-3d;animation:turn 22s linear infinite}
.ring:hover{animation-play-state:paused}
@keyframes turn{from{transform:rotateY(0)}to{transform:rotateY(360deg)}}
.cell{position:absolute;inset:0;margin:auto}
.card{width:150px;height:196px;border-radius:14px;overflow:hidden;background:#fff;
  border:4px solid #fff;box-shadow:0 14px 34px -10px rgba(0,0,0,.6)}
.card img{width:100%;height:100%;object-fit:cover;display:block}
.ph{width:100%;height:100%;display:grid;place-items:center;font-size:38px;color:rgba(255,255,255,.9)}
.ph span{filter:drop-shadow(0 2px 6px rgba(0,0,0,.3))}
.g0{background:linear-gradient(150deg,#ff9ec2,#8b7be0)}
.g1{background:linear-gradient(150deg,#7cf5e0,#5b8def)}
.g2{background:linear-gradient(150deg,#ffd66b,#ff7aa8)}
@media (prefers-reduced-motion:reduce){.ring{animation:none}}
</style>
