<script setup lang="ts">
// กาแล็กซีอวกาศ 3D (Three.js) — ก้นหอยอนุภาค + แกนเรืองแสง + หัวใจอนุภาค + คำลอย + รูปคลิกได้
// client-only (.client.vue) — โหลด three แบบ dynamic เฉพาะฝั่งเบราว์เซอร์
const props = defineProps<{ photos: string[]; words: string[] }>()
const emit = defineEmits<{ open: [number] }>()

const canvas = ref<HTMLCanvasElement | null>(null)
const labelRefs = ref<HTMLElement[]>([])
let dispose = () => {}

onMounted(async () => {
  const THREE = await import('three')
  const { OrbitControls } = await import('three/examples/jsm/controls/OrbitControls.js')
  const el = canvas.value!
  const wrap = el.parentElement!

  const scene = new THREE.Scene()
  const camera = new THREE.PerspectiveCamera(60, wrap.clientWidth / wrap.clientHeight, 0.1, 100)
  camera.position.set(0, 3.6, 8)

  const renderer = new THREE.WebGLRenderer({ canvas: el, antialias: true, alpha: true })
  renderer.setSize(wrap.clientWidth, wrap.clientHeight)
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

  const controls = new OrbitControls(camera, el)
  controls.enableDamping = true
  controls.dampingFactor = 0.06
  controls.enablePan = false
  controls.autoRotate = true
  controls.autoRotateSpeed = 0.55
  controls.minDistance = 4.5
  controls.maxDistance = 14
  controls.target.set(0, 0.7, 0)
  controls.minPolarAngle = 0.5
  controls.maxPolarAngle = 1.75

  // ---------- galaxy ก้นหอย ----------
  const COUNT = 11000, RADIUS = 6, BRANCHES = 4, SPIN = 1.05, RND = 0.42, POW = 2.7
  const inside = new THREE.Color('#ffcf6b'), outside = new THREE.Color('#7a4bff')
  const positions = new Float32Array(COUNT * 3)
  const colors = new Float32Array(COUNT * 3)
  for (let i = 0; i < COUNT; i++) {
    const i3 = i * 3
    const r = Math.pow(Math.random(), 1.4) * RADIUS
    const branch = ((i % BRANCHES) / BRANCHES) * Math.PI * 2
    const spin = r * SPIN
    const rx = Math.pow(Math.random(), POW) * (Math.random() < 0.5 ? 1 : -1) * RND * r
    const ry = Math.pow(Math.random(), POW) * (Math.random() < 0.5 ? 1 : -1) * RND * r * 0.35
    const rz = Math.pow(Math.random(), POW) * (Math.random() < 0.5 ? 1 : -1) * RND * r
    positions[i3] = Math.cos(branch + spin) * r + rx
    positions[i3 + 1] = ry
    positions[i3 + 2] = Math.sin(branch + spin) * r + rz
    const c = inside.clone().lerp(outside, r / RADIUS)
    colors[i3] = c.r; colors[i3 + 1] = c.g; colors[i3 + 2] = c.b
  }
  const gGeo = new THREE.BufferGeometry()
  gGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3))
  gGeo.setAttribute('color', new THREE.BufferAttribute(colors, 3))
  const gMat = new THREE.PointsMaterial({
    size: 0.045, sizeAttenuation: true, depthWrite: false,
    blending: THREE.AdditiveBlending, vertexColors: true, transparent: true, opacity: 0.9,
  })
  const galaxy = new THREE.Points(gGeo, gMat)
  scene.add(galaxy)

  // ---------- แกนกลางเรืองแสง ----------
  const glowCanvas = document.createElement('canvas')
  glowCanvas.width = glowCanvas.height = 128
  const gctx = glowCanvas.getContext('2d')!
  const grad = gctx.createRadialGradient(64, 64, 0, 64, 64, 64)
  grad.addColorStop(0, 'rgba(255,255,255,1)')
  grad.addColorStop(0.25, 'rgba(255,220,150,0.9)')
  grad.addColorStop(0.5, 'rgba(255,120,200,0.5)')
  grad.addColorStop(1, 'rgba(120,80,255,0)')
  gctx.fillStyle = grad
  gctx.fillRect(0, 0, 128, 128)
  const glowTex = new THREE.CanvasTexture(glowCanvas)
  const core = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTex, blending: THREE.AdditiveBlending, transparent: true, depthWrite: false }))
  core.scale.set(3.2, 3.2, 1)
  scene.add(core)

  // ---------- หัวใจอนุภาค (ลอยเหนือแกน) ----------
  const HC = 1400
  const hp = new Float32Array(HC * 3)
  for (let i = 0; i < HC; i++) {
    const t = Math.random() * Math.PI * 2
    const fill = Math.sqrt(Math.random())
    const hx = 16 * Math.sin(t) ** 3
    const hy = 13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t)
    const s = 0.052
    hp[i * 3] = hx * s * fill + (Math.random() - 0.5) * 0.06
    hp[i * 3 + 1] = hy * s * fill + 2.05 + (Math.random() - 0.5) * 0.06
    hp[i * 3 + 2] = (Math.random() - 0.5) * 0.14
  }
  const hGeo = new THREE.BufferGeometry()
  hGeo.setAttribute('position', new THREE.BufferAttribute(hp, 3))
  const heart = new THREE.Points(hGeo, new THREE.PointsMaterial({
    size: 0.05, color: new THREE.Color('#ff5f9e'), depthWrite: false,
    blending: THREE.AdditiveBlending, transparent: true, opacity: 0.95,
  }))
  scene.add(heart)

  // ---------- รูป (ระนาบลอย คลิกได้) ----------
  const loader = new THREE.TextureLoader()
  loader.crossOrigin = 'anonymous'
  const photoMeshes: any[] = []
  const nP = props.photos.length
  props.photos.forEach((url, i) => {
    const a = (i / Math.max(nP, 1)) * Math.PI * 2
    const rr = 3.5 + (i % 2) * 0.7
    const geo = new THREE.PlaneGeometry(1.1, 1.1)
    const mat = new THREE.MeshBasicMaterial({ color: 0x223055, side: THREE.DoubleSide, transparent: true })
    const m = new THREE.Mesh(geo, mat)
    m.position.set(Math.cos(a) * rr, 0.7 + Math.sin(i * 1.7) * 0.5, Math.sin(a) * rr)
    m.userData = { index: i, baseY: m.position.y, phase: i }
    scene.add(m)
    photoMeshes.push(m)
    loader.load(url, (tex) => {
      if ('colorSpace' in tex) (tex as any).colorSpace = (THREE as any).SRGBColorSpace
      mat.map = tex; mat.color.set(0xffffff); mat.needsUpdate = true
    })
  })

  // ---------- คำลอย (ตำแหน่ง 3D → project เป็น HTML) ----------
  const wordPos = props.words.map((_, i) => {
    const a = (i / Math.max(props.words.length, 1)) * Math.PI * 2 + 0.4
    const rr = 4.6 + (i % 3) * 0.6
    return new THREE.Vector3(Math.cos(a) * rr, 0.4 + Math.sin(i * 2.1) * 1.1, Math.sin(a) * rr)
  })

  // ---------- คลิกรูป ----------
  const ray = new THREE.Raycaster()
  const ptr = new THREE.Vector2()
  let downX = 0, downY = 0
  function onDown(e: PointerEvent) { downX = e.clientX; downY = e.clientY }
  function onUp(e: PointerEvent) {
    if (Math.hypot(e.clientX - downX, e.clientY - downY) > 8) return // ลากอยู่ ไม่ใช่คลิก
    const rect = el.getBoundingClientRect()
    ptr.x = ((e.clientX - rect.left) / rect.width) * 2 - 1
    ptr.y = -((e.clientY - rect.top) / rect.height) * 2 + 1
    ray.setFromCamera(ptr, camera)
    const hit = ray.intersectObjects(photoMeshes)[0]
    if (hit) emit('open', hit.object.userData.index)
  }
  el.addEventListener('pointerdown', onDown)
  el.addEventListener('pointerup', onUp)

  // ---------- resize ----------
  function onResize() {
    camera.aspect = wrap.clientWidth / wrap.clientHeight
    camera.updateProjectionMatrix()
    renderer.setSize(wrap.clientWidth, wrap.clientHeight)
  }
  window.addEventListener('resize', onResize)

  // ---------- loop ----------
  const clock = new THREE.Clock()
  let raf = 0
  function tick() {
    const t = clock.getElapsedTime()
    galaxy.rotation.y = t * 0.06
    core.scale.setScalar(3.0 + Math.sin(t * 1.5) * 0.18)
    heart.position.y = Math.sin(t * 0.9) * 0.08
    heart.rotation.z = Math.sin(t * 0.5) * 0.05
    photoMeshes.forEach((m) => {
      m.position.y = m.userData.baseY + Math.sin(t * 0.8 + m.userData.phase) * 0.14
      m.lookAt(camera.position)
    })
    // project คำลอย
    for (let i = 0; i < wordPos.length; i++) {
      const lbl = labelRefs.value[i]; if (!lbl) continue
      const v = wordPos[i].clone().project(camera)
      const x = (v.x * 0.5 + 0.5) * wrap.clientWidth
      const y = (-v.y * 0.5 + 0.5) * wrap.clientHeight
      const vis = v.z < 1
      lbl.style.transform = `translate(-50%,-50%) translate(${x}px,${y}px)`
      lbl.style.opacity = vis ? String(0.85 - Math.max(0, v.z) * 0.5) : '0'
    }
    controls.update()
    renderer.render(scene, camera)
    raf = requestAnimationFrame(tick)
  }
  tick()

  dispose = () => {
    cancelAnimationFrame(raf)
    window.removeEventListener('resize', onResize)
    el.removeEventListener('pointerdown', onDown)
    el.removeEventListener('pointerup', onUp)
    controls.dispose()
    gGeo.dispose(); gMat.dispose(); hGeo.dispose()
    photoMeshes.forEach(m => { m.geometry.dispose(); m.material.map?.dispose?.(); m.material.dispose() })
    glowTex.dispose(); renderer.dispose()
  }
})

onBeforeUnmount(() => dispose())
</script>

<template>
  <div class="three-wrap">
    <canvas ref="canvas"></canvas>
    <div class="labels">
      <div v-for="(w, i) in words" :key="i" class="lbl"
        :ref="el => { if (el) labelRefs[i] = el as HTMLElement }">{{ w }}</div>
    </div>
  </div>
</template>

<style scoped>
.three-wrap{position:absolute;inset:0}
.three-wrap canvas{width:100%;height:100%;display:block;touch-action:none}
.labels{position:absolute;inset:0;pointer-events:none;overflow:hidden}
.lbl{position:absolute;left:0;top:0;white-space:nowrap;
  font-family:"Didot","Cormorant Garamond",Georgia,serif;font-style:italic;
  font-size:15px;letter-spacing:.08em;color:#fff;
  text-shadow:0 0 12px rgba(255,150,220,.8),0 0 4px rgba(180,140,255,.9);will-change:transform,opacity}
</style>
