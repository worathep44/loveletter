<script setup lang="ts">
// การ์ตูนน่ารักแทนรูป (ตอนลูกค้าไม่ใส่รูป) — วนตาม index 4 แบบ
const props = defineProps<{ i?: number }>()
const scene = computed(() => (props.i ?? 0) % 4)
</script>

<template>
  <div class="art">
    <!-- 0: บีนกอดกัน -->
    <svg v-if="scene === 0" viewBox="0 0 200 130" preserveAspectRatio="xMidYMid slice">
      <rect width="200" height="130" fill="#ffe6f0" />
      <path d="M40 26c-4-8 8-13 10-4 2-9 14-4 10 4-3 6-10 10-10 10s-7-4-10-10z" fill="#ff9ec2" />
      <path d="M164 34c-3-6 6-10 8-3 1-7 10-3 7 3-2 5-7 8-7 8s-6-3-8-8z" fill="#ffc94d" />
      <ellipse cx="80" cy="86" rx="30" ry="34" fill="#ffcf9e" />
      <ellipse cx="120" cy="86" rx="30" ry="34" fill="#ff9ec2" />
      <circle cx="72" cy="82" r="3" fill="#5b3a5f" /><circle cx="88" cy="82" r="3" fill="#5b3a5f" />
      <circle cx="112" cy="82" r="3" fill="#5b3a5f" /><circle cx="128" cy="82" r="3" fill="#5b3a5f" />
      <circle cx="66" cy="92" r="5" fill="#ff87b0" opacity=".55" /><circle cx="94" cy="92" r="5" fill="#ff87b0" opacity=".55" />
      <circle cx="106" cy="92" r="5" fill="#e5568f" opacity=".5" /><circle cx="134" cy="92" r="5" fill="#e5568f" opacity=".5" />
      <path d="M76 92q4 4 8 0" stroke="#5b3a5f" stroke-width="2" fill="none" stroke-linecap="round" />
      <path d="M116 92q4 4 8 0" stroke="#5b3a5f" stroke-width="2" fill="none" stroke-linecap="round" />
    </svg>

    <!-- 1: แมวถือหัวใจ -->
    <svg v-else-if="scene === 1" viewBox="0 0 200 130" preserveAspectRatio="xMidYMid slice">
      <rect width="200" height="130" fill="#e7f0ff" />
      <path d="M74 46l8 16h-16z" fill="#fff" stroke="#ffb3d1" stroke-width="3" stroke-linejoin="round" />
      <path d="M126 46l8 16h-16z" fill="#fff" stroke="#ffb3d1" stroke-width="3" stroke-linejoin="round" />
      <ellipse cx="100" cy="82" rx="42" ry="36" fill="#fff" stroke="#ffb3d1" stroke-width="3" />
      <circle cx="86" cy="78" r="3.5" fill="#5b3a5f" /><circle cx="114" cy="78" r="3.5" fill="#5b3a5f" />
      <circle cx="78" cy="88" r="5" fill="#ffb3cf" opacity=".6" /><circle cx="122" cy="88" r="5" fill="#ffb3cf" opacity=".6" />
      <path d="M96 86q4 5 8 0" stroke="#5b3a5f" stroke-width="2" fill="none" stroke-linecap="round" />
      <path d="M100 96c-4-7-15-6-15 2 0 6 8 10 15 15 7-5 15-9 15-15 0-8-11-9-15-2z" fill="#ff6aa5" />
    </svg>

    <!-- 2: หัวใจมีหน้า -->
    <svg v-else-if="scene === 2" viewBox="0 0 200 130" preserveAspectRatio="xMidYMid slice">
      <rect width="200" height="130" fill="#fff0e6" />
      <g opacity=".8">
        <circle cx="40" cy="34" r="2.5" fill="#ffb84d" /><circle cx="160" cy="30" r="3" fill="#ff9ec2" />
        <circle cx="168" cy="86" r="2.5" fill="#8b5cf6" /><circle cx="34" cy="90" r="3" fill="#ff87b0" />
      </g>
      <path d="M100 108c-16-14-42-26-42-52 0-16 20-24 42-6 22-18 42-10 42 6 0 26-26 38-42 52z" fill="#ff6aa5" />
      <circle cx="88" cy="66" r="4" fill="#fff" /><circle cx="112" cy="66" r="4" fill="#fff" />
      <circle cx="88" cy="67" r="2" fill="#5b3a5f" /><circle cx="112" cy="67" r="2" fill="#5b3a5f" />
      <circle cx="80" cy="76" r="5" fill="#ffd0e0" opacity=".7" /><circle cx="120" cy="76" r="5" fill="#ffd0e0" opacity=".7" />
      <path d="M94 76q6 6 12 0" stroke="#fff" stroke-width="2.5" fill="none" stroke-linecap="round" />
    </svg>

    <!-- 3: หมีแก้มหัวใจ -->
    <svg v-else viewBox="0 0 200 130" preserveAspectRatio="xMidYMid slice">
      <rect width="200" height="130" fill="#f0eaff" />
      <circle cx="72" cy="56" r="14" fill="#e6b98a" /><circle cx="128" cy="56" r="14" fill="#e6b98a" />
      <circle cx="100" cy="82" r="40" fill="#f0c89b" />
      <circle cx="88" cy="78" r="3.5" fill="#5b3a5f" /><circle cx="112" cy="78" r="3.5" fill="#5b3a5f" />
      <ellipse cx="100" cy="90" rx="12" ry="9" fill="#fff5ec" />
      <circle cx="100" cy="87" r="3" fill="#5b3a5f" />
      <path d="M100 90v4M100 94q-4 3-7 1M100 94q4 3 7 1" stroke="#5b3a5f" stroke-width="1.6" fill="none" stroke-linecap="round" />
      <path d="M76 96c-3-5-11-4-11 1 0 4 6 7 11 11 5-4 11-7 11-11 0-5-8-6-11-1z" fill="#ff6aa5" />
      <path d="M124 96c-3-5-11-4-11 1 0 4 6 7 11 11 5-4 11-7 11-11 0-5-8-6-11-1z" fill="#ff6aa5" />
    </svg>
  </div>
</template>

<style scoped>
.art{width:100%;height:100%}
.art svg{width:100%;height:100%;display:block}
</style>
