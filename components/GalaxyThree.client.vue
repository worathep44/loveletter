<script setup lang="ts">
// COSMIC JOURNEY (v2) — กล้องวิ่งบน spline โค้งลื่น + lerp damping (buttery) + scroll/ลากเพื่อบิน
// เทคนิคเดียวกับเว็บ WebGL รางวัลๆ: CatmullRomCurve3 + getPointAt + look-ahead + damped progress
const props = defineProps<{
  memories: { photo: string | null; kind?: string; title?: string; videoUrl?: string; videoSource?: string }[]
  paused?: boolean
  resetKey?: number
}>()
const emit = defineEmits<{ memory: [number]; finale: [] }>()

const canvas = ref<HTMLCanvasElement | null>(null)
const capRefs = ref<HTMLElement[]>([])
let dispose = () => {}
const pausedRef = { v: false }
watch(() => props.paused, v => { pausedRef.v = !!v })

onMounted(async () => {
  const THREE = await import('three')
  const { EffectComposer } = await import('three/examples/jsm/postprocessing/EffectComposer.js')
  const { RenderPass } = await import('three/examples/jsm/postprocessing/RenderPass.js')
  const { UnrealBloomPass } = await import('three/examples/jsm/postprocessing/UnrealBloomPass.js')

  const el = canvas.value!
  const wrap = el.parentElement!
  const W = () => wrap.clientWidth, H = () => wrap.clientHeight

  const scene = new THREE.Scene()
  scene.fog = new THREE.FogExp2(0x07030f, 0.014)
  const camera = new THREE.PerspectiveCamera(62, W() / H(), 0.1, 500)

  const renderer = new THREE.WebGLRenderer({ canvas: el, antialias: true, alpha: true })
  renderer.setSize(W(), H())
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

  const composer = new EffectComposer(renderer)
  composer.addPass(new RenderPass(scene, camera))
  // strength ต่ำ + threshold สูง = เฉพาะดาว/แสงจ้าจริงๆ ที่ฟุ้ง (รูปไม่โดนกลืนเป็นสีขาว)
  const bloom = new UnrealBloomPass(new THREE.Vector2(W() * 0.5, H() * 0.5), 0.42, 0.6, 0.72) // ครึ่งจอ
  composer.addPass(bloom)
  composer.setSize(W(), H())

  const SPACING = 14
  const nP = Math.max(props.memories.length, 1)
  const DEPTH = nP * SPACING + 24

  // ---------- เส้นทางกล้อง (spline โค้งลื่น) + จุดของแต่ละสถานี ----------
  const stations: { x: number; y: number; z: number }[] = []
  const ctrl: any[] = [new THREE.Vector3(0, 0, 8)]
  for (let i = 0; i < nP; i++) {
    const z = -(i + 1) * SPACING
    const wx = Math.sin(i * 0.9) * 2.4          // กล้องส่ายซ้ายขวานุ่มๆ
    const wy = Math.cos(i * 0.7) * 1.3
    ctrl.push(new THREE.Vector3(wx, wy, z))
    // รูปวางเยื้องจากแนวกล้องเล็กน้อย → เห็นเต็มตอนบินเข้าใกล้ แล้วปัดผ่าน
    const side = i % 2 ? 1 : -1
    stations.push({ x: wx + side * 2.0, y: wy + (i % 2 ? 0.6 : -0.6), z })
  }
  ctrl.push(new THREE.Vector3(0, 0, -DEPTH))     // ลานโล่งตอนจบ
  const curve = new THREE.CatmullRomCurve3(ctrl, false, 'centripetal', 0.5)

  // ---------- starfield ----------
  const palette = [0xfff6e8, 0xffb3d0, 0xffd9a0, 0x9ff0e0, 0xc9a6ff]
  function makeStars(n: number, spread: number, size: number, zA: number, zB: number) {
    const pos = new Float32Array(n * 3), col = new Float32Array(n * 3), c = new THREE.Color()
    for (let i = 0; i < n; i++) {
      pos[i * 3] = (Math.random() - 0.5) * spread
      pos[i * 3 + 1] = (Math.random() - 0.5) * spread
      pos[i * 3 + 2] = zA + Math.random() * (zB - zA)
      c.set(palette[(Math.random() * palette.length) | 0])
      col[i * 3] = c.r; col[i * 3 + 1] = c.g; col[i * 3 + 2] = c.b
    }
    const g = new THREE.BufferGeometry()
    g.setAttribute('position', new THREE.BufferAttribute(pos, 3))
    g.setAttribute('color', new THREE.BufferAttribute(col, 3))
    const p = new THREE.Points(g, new THREE.PointsMaterial({ size, sizeAttenuation: true, depthWrite: false,
      blending: THREE.AdditiveBlending, vertexColors: true, transparent: true }))
    scene.add(p)
    return { p, pos, g, n }
  }
  const near = makeStars(2400, 64, 0.12, 10, -DEPTH - 20)
  const far = makeStars(1300, 150, 0.34, -20, -DEPTH - 60)

  // ---------- เนบิวลา ----------
  function glowTex(stops: [number, string][]) {
    const cv = document.createElement('canvas'); cv.width = cv.height = 160
    const g = cv.getContext('2d')!, rg = g.createRadialGradient(80, 80, 0, 80, 80, 80)
    stops.forEach(([o, c]) => rg.addColorStop(o, c)); g.fillStyle = rg; g.fillRect(0, 0, 160, 160)
    return new THREE.CanvasTexture(cv)
  }
  const nebA = glowTex([[0, 'rgba(255,110,190,0.9)'], [0.5, 'rgba(200,60,160,0.35)'], [1, 'rgba(120,40,140,0)']])
  const nebB = glowTex([[0, 'rgba(90,240,220,0.7)'], [0.5, 'rgba(50,180,200,0.3)'], [1, 'rgba(40,120,160,0)']])
  for (let i = 0; i < 7; i++) {
    const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: i % 2 ? nebB : nebA,
      blending: THREE.AdditiveBlending, transparent: true, opacity: 0.3, depthWrite: false }))
    const sz = 16 + Math.random() * 22
    s.scale.set(sz, sz, 1)
    s.position.set((Math.random() - 0.5) * 32, (Math.random() - 0.5) * 20, -8 - Math.random() * DEPTH)
    scene.add(s)
  }

  // ---------- ดาวความทรงจำ (รูป) ----------
  const loader = new THREE.TextureLoader(); loader.crossOrigin = 'anonymous'
  const haloTex = glowTex([[0, 'rgba(255,230,200,0.95)'], [0.4, 'rgba(255,150,210,0.5)'], [1, 'rgba(255,120,200,0)']])
  // การ์ดวิดีโอ (ตอนไม่มี poster เช่น TikTok/ไฟล์)
  function videoCardTex() {
    const cv = document.createElement('canvas'); cv.width = 360; cv.height = 540
    const g = cv.getContext('2d')!
    const grd = g.createLinearGradient(0, 0, 360, 540); grd.addColorStop(0, '#3a1a5c'); grd.addColorStop(1, '#160c30')
    g.fillStyle = grd; g.fillRect(0, 0, 360, 540)
    g.fillStyle = 'rgba(255,255,255,.92)'; g.beginPath(); g.moveTo(150, 218); g.lineTo(150, 322); g.lineTo(242, 270); g.closePath(); g.fill()
    g.fillStyle = 'rgba(255,214,107,.9)'; g.font = 'bold 30px "Sarabun",sans-serif'; g.textAlign = 'center'; g.fillText('วิดีโอ', 180, 405)
    return new THREE.CanvasTexture(cv)
  }
  // ป้าย ▶ สำหรับดาววิดีโอ
  const playCv = document.createElement('canvas'); playCv.width = playCv.height = 128
  const pg = playCv.getContext('2d')!
  pg.fillStyle = 'rgba(0,0,0,.55)'; pg.beginPath(); pg.arc(64, 64, 58, 0, 7); pg.fill()
  pg.fillStyle = '#fff'; pg.beginPath(); pg.moveTo(52, 40); pg.lineTo(52, 88); pg.lineTo(94, 64); pg.closePath(); pg.fill()
  const playTex = new THREE.CanvasTexture(playCv)

  const stars: any[] = []
  const vids: HTMLVideoElement[] = []
  props.memories.forEach((mem, i) => {
    const st = stations[i]
    const isVideo = mem.kind === 'video'
    const isFileVid = isVideo && mem.videoSource === 'file' && !!mem.videoUrl
    const grp = new THREE.Group(); grp.position.set(st.x, st.y, st.z)
    const halo = new THREE.Sprite(new THREE.SpriteMaterial({ map: haloTex, blending: THREE.AdditiveBlending, transparent: true, depthWrite: false, opacity: 0 }))
    halo.scale.set(5, 5, 1); grp.add(halo)
    const plane = new THREE.Mesh(new THREE.PlaneGeometry(1, 1),
      new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0, side: THREE.DoubleSide }))
    grp.add(plane)
    const dot = new THREE.Sprite(new THREE.SpriteMaterial({ map: haloTex, blending: THREE.AdditiveBlending, transparent: true, depthWrite: false, opacity: 0.9 }))
    dot.scale.set(1.2, 1.2, 1); grp.add(dot)
    grp.userData = { index: i, halo, plane, mat: plane.material, dot, aspect: 1, badge: null, isVideo, video: null, vtex: null }
    // ป้าย ▶ เฉพาะวิดีโอที่เล่นในการ์ดไม่ได้ (YouTube/TikTok) → กดดู
    if (isVideo && !isFileVid) {
      const badge = new THREE.Sprite(new THREE.SpriteMaterial({ map: playTex, transparent: true, depthWrite: false, opacity: 0 }))
      badge.position.set(0, 0, 0.05); grp.add(badge); grp.userData.badge = badge
    }
    scene.add(grp); stars.push(grp)

    if (isFileVid) {
      // ★ เล่นวิดีโอในการ์ดเลย (VideoTexture) — เงียบ+วนลูป, กดเพื่อดูเต็ม+เสียง
      const vid = document.createElement('video')
      vid.src = mem.videoUrl!; vid.crossOrigin = 'anonymous'; vid.loop = true
      vid.muted = true; vid.playsInline = true; vid.setAttribute('playsinline', ''); vid.preload = 'auto'
      vid.addEventListener('loadedmetadata', () => { if (vid.videoWidth) grp.userData.aspect = vid.videoWidth / vid.videoHeight })
      const vtex = new THREE.VideoTexture(vid)
      if ('colorSpace' in vtex) (vtex as any).colorSpace = (THREE as any).SRGBColorSpace
      ;(plane.material as any).map = vtex; (plane.material as any).needsUpdate = true
      grp.userData.video = vid; grp.userData.vtex = vtex; vids.push(vid)
    } else if (mem.photo) {
      loader.load(mem.photo, (tex) => {
        if ('colorSpace' in tex) (tex as any).colorSpace = (THREE as any).SRGBColorSpace
        const img = tex.image
        if (img?.width && img?.height) grp.userData.aspect = img.width / img.height
        ;(plane.material as any).map = tex; (plane.material as any).needsUpdate = true
      })
    } else if (isVideo) {
      ;(plane.material as any).map = videoCardTex(); (plane.material as any).needsUpdate = true
      grp.userData.aspect = 0.66
    }
  })

  // ---------- หัวใจอนุภาค (จบ) ----------
  const HC = 1600, hpos = new Float32Array(HC * 3)
  for (let i = 0; i < HC; i++) {
    const t = Math.random() * Math.PI * 2, fill = Math.sqrt(Math.random())
    const hx = 16 * Math.sin(t) ** 3
    const hy = 13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t)
    const s = 0.14
    hpos[i * 3] = hx * s * fill + (Math.random() - 0.5) * 0.12
    hpos[i * 3 + 1] = hy * s * fill + (Math.random() - 0.5) * 0.12
    hpos[i * 3 + 2] = (Math.random() - 0.5) * 0.3
  }
  const hGeo = new THREE.BufferGeometry(); hGeo.setAttribute('position', new THREE.BufferAttribute(hpos, 3))
  const heartMat = new THREE.PointsMaterial({ size: 0.09, color: new THREE.Color(0xffb0d0),
    blending: THREE.AdditiveBlending, transparent: true, opacity: 0, depthWrite: false })
  const heart = new THREE.Points(hGeo, heartMat); heart.visible = false; scene.add(heart)

  // ---------- progress: target + actual (lerp damping) ----------
  let targetT = 0, actualT = 0, finaled = false
  let lastReset = props.resetKey ?? 0     // เช็คใน loop เพื่อ reset (ไม่ใช้ watch เพราะ onMounted หลัง await หลุด scope)
  const DURATION = nP * 3.2 + 5           // auto-drift ให้เล่นเอง (วินาที)
  // input: scroll / ลาก
  const onWheel = (e: WheelEvent) => { targetT = clamp01(targetT + e.deltaY * 0.00035) }
  let dragging = false, lastY = 0, downX = 0, downY = 0, moved = 0
  const onDown = (e: PointerEvent) => { dragging = true; lastY = downY = e.clientY; downX = e.clientX; moved = 0 }
  const onMove = (e: PointerEvent) => {
    if (!dragging) return
    const dy = e.clientY - lastY; lastY = e.clientY; moved += Math.abs(dy)
    targetT = clamp01(targetT - dy * 0.0016)
  }
  const onUp = (e: PointerEvent) => {
    dragging = false
    if (moved < 8) tapPhoto(e)         // ไม่ได้ลาก = แตะ → เปิดรูป
  }
  function tapPhoto(e: PointerEvent) {
    const r = el.getBoundingClientRect()
    ptr.x = ((e.clientX - r.left) / r.width) * 2 - 1
    ptr.y = -((e.clientY - r.top) / r.height) * 2 + 1
    ray.setFromCamera(ptr, camera)
    const hit = ray.intersectObjects(stars.map(s => s.userData.plane))[0]
    if (hit) emit('memory', (hit.object.parent as any).userData.index)
  }
  function clamp01(v: number) { return v < 0 ? 0 : v > 1 ? 1 : v }
  const ray = new THREE.Raycaster(), ptr = new THREE.Vector2()
  el.addEventListener('wheel', onWheel, { passive: true })
  el.addEventListener('pointerdown', onDown)
  el.addEventListener('pointermove', onMove)
  el.addEventListener('pointerup', onUp)

  const onResize = () => {
    camera.aspect = W() / H(); camera.updateProjectionMatrix()
    renderer.setSize(W(), H()); composer.setSize(W(), H()); bloom.setSize(W() * 0.5, H() * 0.5)
  }
  window.addEventListener('resize', onResize)

  // ---------- loop ----------
  const clock = new THREE.Clock()
  let raf = 0
  const pos = new THREE.Vector3(), ahead = new THREE.Vector3(), tmp = new THREE.Vector3()
  function tick() {
    const dt = Math.min(clock.getDelta(), 0.05), t = clock.elapsedTime
    // สั่งเริ่มเดินทางใหม่ (วนซ้ำ) — reset แบบประหยัด ไม่ remount
    if ((props.resetKey ?? 0) !== lastReset) {
      lastReset = props.resetKey ?? 0
      targetT = 0; actualT = 0; finaled = false; heart.visible = false; heartMat.opacity = 0
    }
    // auto-drift ไปข้างหน้าเรื่อยๆ (ถ้ายังไม่ pause และยังไม่สุด)
    if (!pausedRef.v && !dragging && targetT < 1) targetT = clamp01(targetT + dt / DURATION)
    // ★ lerp damping = ความลื่นแบบโปร
    actualT += (targetT - actualT) * Math.min(1, dt * 3.2)

    // กล้องวิ่งบน spline + มองไปข้างหน้าตามเส้น
    curve.getPointAt(clamp01(actualT), pos)
    curve.getPointAt(clamp01(actualT + 0.012), ahead)
    camera.position.copy(pos)
    camera.position.x += Math.sin(t * 0.4) * 0.25   // ลอยเบาๆ ให้มีชีวิต
    camera.position.y += Math.cos(t * 0.33) * 0.18
    camera.lookAt(ahead)

    // starfield รีไซเคิล
    const np = near.pos
    for (let i = 0; i < near.n; i++) if (np[i * 3 + 2] > camera.position.z + 8) np[i * 3 + 2] -= DEPTH + 28
    near.g.attributes.position.needsUpdate = true

    // รูป: บาน/หรี่ตามระยะ (3D)
    stars.forEach((grp) => {
      const d = camera.position.distanceTo(grp.position)
      const n01 = Math.max(0, 1 - d / 13)
      const u = grp.userData
      u.mat.opacity = Math.min(1, n01 * 1.8)
      const sz = 1.5 + n01 * 3.2, asp = u.aspect || 1
      u.plane.scale.set(asp >= 1 ? sz : sz * asp, asp >= 1 ? sz / asp : sz, 1)
      u.plane.lookAt(camera.position)
      // halo เป็นแค่แสงดาวตอนไกล → จางลงตอนเข้าใกล้ (ไม่ให้กลืนรูป)
      u.halo.material.opacity = (1 - n01) * 0.45; u.halo.scale.setScalar(2 + (1 - n01) * 2)
      u.dot.material.opacity = Math.max(0, 0.7 - n01 * 1.4)
      if (u.badge) { u.badge.material.opacity = Math.min(1, n01 * 1.9); u.badge.scale.setScalar(sz * 0.34) }
      // วิดีโอไฟล์: เล่นในการ์ดตอนเข้าใกล้ (หยุดตอนไกล ประหยัดทรัพยากร)
      if (u.video) {
        if (n01 > 0.06) { if (u.video.paused) u.video.play().catch(() => {}) }
        else if (!u.video.paused) u.video.pause()
      }
      const lbl = capRefs.value[u.index]
      if (lbl) {
        tmp.copy(grp.position); tmp.y -= sz * 0.62; tmp.project(camera)
        const vis = tmp.z < 1 && n01 > 0.5
        lbl.style.transform = `translate(-50%,-50%) translate(${(tmp.x * 0.5 + 0.5) * W()}px,${(-tmp.y * 0.5 + 0.5) * H()}px)`
        lbl.style.opacity = vis ? String(n01) : '0'
      }
    })

    // จบ → หัวใจ
    if (actualT > 0.985) {
      if (!finaled) { finaled = true; emit('finale') }
      heart.visible = true
      curve.getPointAt(1, tmp)
      heart.position.set(tmp.x, tmp.y + 0.3, tmp.z + 6)
      heart.lookAt(camera.position); heart.rotation.z = Math.sin(t * 0.6) * 0.05
      heartMat.opacity = Math.min(1, heartMat.opacity + dt * 0.7)
      heartMat.size = 0.09 + Math.sin(t * 2) * 0.012
    }

    composer.render()
    raf = requestAnimationFrame(tick)
  }
  tick()

  dispose = () => {
    cancelAnimationFrame(raf)
    window.removeEventListener('resize', onResize)
    el.removeEventListener('wheel', onWheel)
    el.removeEventListener('pointerdown', onDown); el.removeEventListener('pointermove', onMove); el.removeEventListener('pointerup', onUp)
    ;[near, far].forEach(s => { s.g.dispose(); (s.p.material as any).dispose() })
    vids.forEach(v => { v.pause(); v.removeAttribute('src'); v.load() })
    stars.forEach(g => { g.userData.plane.geometry.dispose(); g.userData.vtex?.dispose?.() })
    hGeo.dispose(); heartMat.dispose(); [haloTex, nebA, nebB, playTex].forEach(tx => tx.dispose())
    composer.dispose?.(); renderer.dispose()
  }
})

onBeforeUnmount(() => dispose())
</script>

<template>
  <div class="three-wrap">
    <canvas ref="canvas"></canvas>
    <div class="caps">
      <div v-for="(m, i) in memories" :key="i" class="cap"
        :ref="el => { if (el) capRefs[i] = el as HTMLElement }">
        <span v-if="m.title">{{ m.title }}</span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.three-wrap{position:absolute;inset:0}
.three-wrap canvas{width:100%;height:100%;display:block;touch-action:none}
.caps{position:absolute;inset:0;pointer-events:none;overflow:hidden}
.cap{position:absolute;left:0;top:0;white-space:nowrap;
  font-family:"Didot","Cormorant Garamond",Georgia,serif;font-style:italic;font-size:16px;
  color:#fff;text-shadow:0 0 14px rgba(255,150,220,.9);opacity:0;will-change:transform,opacity}
</style>
