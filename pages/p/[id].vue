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
      { name: 'theme-color', content: themePrimary(data.value.theme) },
    ],
  })
}
</script>

<template>
  <div v-if="error" class="notfound-wrap">
    <div class="notfound">
      <div class="nf-emoji">💌</div>
      <h1>ไม่พบจดหมายนี้</h1>
      <p>ลิงก์อาจหมดอายุ หรือถูกลบไปแล้ว</p>
    </div>
  </div>

  <LetterView v-else :data="data" />
</template>

<style scoped>
.notfound-wrap{
  min-height:100dvh;display:flex;align-items:center;justify-content:center;padding:24px;
  font-family:"Sarabun","Noto Serif Thai",Georgia,serif;
  background:radial-gradient(120% 80% at 50% -10%, #3a2028 0%, transparent 55%), #1a1013;
}
.notfound{text-align:center;color:#FBF3E7}
.nf-emoji{font-size:54px;margin-bottom:16px}
.notfound h1{font-size:26px;font-weight:600}
.notfound p{color:rgba(251,243,231,.6);margin-top:8px}
</style>
