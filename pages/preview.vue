<script setup lang="ts">
// หน้าพรีวิวธีม — ใช้ข้อมูลตัวอย่าง ให้ลูกค้า/เราเห็นหน้าตาจริงก่อนเลือก
// เข้าผ่าน /preview?theme=valentine  (มีแถบสลับธีมด้านล่าง)
const route = useRoute()

const current = ref(
  (Array.isArray(route.query.theme) ? route.query.theme[0] : route.query.theme) || THEMES[0].value,
)
if (!THEMES.some(t => t.value === current.value)) current.value = THEMES[0].value

const data = computed(() => sampleLetter(current.value))

// key บังคับ re-mount ตอนสลับธีม → เล่นอนิเมชันเปิดผนึกใหม่ทุกครั้ง
useHead({ title: 'ตัวอย่างธีม · LoveLetter' })
</script>

<template>
  <div class="prev">
    <div class="badge">ตัวอย่าง · ข้อมูลสมมติ</div>

    <LetterView :key="current" :data="data" />

    <div class="switcher">
      <span class="hint">เลือกธีมเพื่อดู</span>
      <div class="chips">
        <button
          v-for="t in THEMES"
          :key="t.value"
          class="chip"
          :class="{ on: current === t.value }"
          :style="{ '--c': t.swatch.primary, '--g': t.swatch.gate }"
          @click="current = t.value"
        >
          <i class="dot"></i>{{ t.label }}
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.prev{position:relative;min-height:100dvh;font-family:"Sarabun","Noto Sans Thai",system-ui,sans-serif}
.badge{
  position:fixed;top:14px;left:50%;transform:translateX(-50%);z-index:80;
  background:rgba(20,16,18,.72);color:#fff;font-size:12px;letter-spacing:.02em;
  padding:6px 14px;border-radius:20px;backdrop-filter:blur(8px);border:1px solid rgba(255,255,255,.14)
}
.switcher{
  position:fixed;left:50%;bottom:16px;transform:translateX(-50%);z-index:80;
  display:flex;flex-direction:column;align-items:center;gap:8px;width:calc(100% - 24px);max-width:520px;
  background:rgba(20,16,18,.82);backdrop-filter:blur(12px);border:1px solid rgba(255,255,255,.14);
  padding:12px 14px;border-radius:20px;box-shadow:0 20px 50px -20px rgba(0,0,0,.7)
}
.switcher .hint{font-size:11px;letter-spacing:.16em;text-transform:uppercase;color:rgba(255,255,255,.5)}
.chips{display:flex;flex-wrap:wrap;gap:7px;justify-content:center}
.chip{
  display:inline-flex;align-items:center;gap:7px;cursor:pointer;font:inherit;font-size:13px;font-weight:600;
  color:rgba(255,255,255,.82);background:rgba(255,255,255,.06);border:1.5px solid transparent;
  padding:7px 13px;border-radius:20px;transition:all .15s
}
.chip .dot{width:11px;height:11px;border-radius:50%;background:var(--g);box-shadow:0 0 0 2px rgba(255,255,255,.18)}
.chip:hover{background:rgba(255,255,255,.12)}
.chip.on{background:#fff;color:#1a1013;border-color:#fff}
.chip.on .dot{box-shadow:0 0 0 2px rgba(0,0,0,.12)}
</style>
