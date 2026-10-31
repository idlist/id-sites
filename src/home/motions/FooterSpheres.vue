<script setup lang="ts">
import { FooterBleed, getCenterRadius } from '@home/designs/footer'
import { useElementVisibility, useEventListener, useResizeObserver } from '@vueuse/core'
import { clamp, createTimer, degToRad, radToDeg, random, type Timer } from 'animejs'
import { Bodies, Body, Composite, Engine, Vector } from 'matter-js'
import { onBeforeUnmount, onMounted, useTemplateRef, watch } from 'vue'

const props = defineProps<{
  width: number
  height: number
  activate?: boolean
}>()

type CanvasCtx = CanvasRenderingContext2D

const $canvas = useTemplateRef('$canvas')
const canvasVisible = useElementVisibility($canvas)

const EngineGravity = 0.8
const BubbleRadiusRatio = 0.042
const BubbleDropInterval = 50
const BubbleMaxCount = 256
const BubbleMinRadius = 40
const BubbleMaxRadius = 80

let canvasWidth = 0
let canvasHeight = 0
let bubbleRadius = BubbleMinRadius
let centerRadius = 0
let bubbleCount = 0
let dropTimer = 0
let timer: Timer | null = null

const engine: Engine = Engine.create({
  gravity: { scale: 0.001 * EngineGravity },
})
const walls: Body[] = []
let centerSpace: Body | null = null
const bubbles: Body[] = []

class Bubble {
  x: number
  y: number
  r: number

  constructor(x: number, y: number, r: number) {
    this.x = x
    this.y = y
    this.r = r
  }

  draw(ctx: CanvasCtx) {
    ctx.lineJoin = 'round'

    // Base.
    ctx.fillStyle = '#222'

    ctx.beginPath()
    ctx.arc(this.x, this.y, this.r - 4, 0, 2 * Math.PI)
    ctx.fill()

    // Outer circle.
    ctx.lineWidth = 2
    ctx.strokeStyle = '#ccc'

    ctx.beginPath()
    ctx.arc(this.x, this.y, this.r, 0, 2 * Math.PI * 2)
    ctx.stroke()

    const rhl = this.r - 16
    const rcap = 4

    // Small highlight.
    ctx.strokeStyle = '#aaa'
    ctx.lineWidth = 1.5

    ctx.beginPath()

    const ashl = -70
    const xshl = this.x + rhl * Math.cos(degToRad(ashl))
    const yshl = this.y + rhl * Math.sin(degToRad(ashl))

    ctx.arc(xshl, yshl, rcap, 0, 2 * Math.PI)
    ctx.stroke()

    // Large highlight.
    ctx.beginPath()

    const alhl1 = ashl + radToDeg(rcap * 4 / rhl)
    const alhl2 = -15

    const xlhl1 = this.x + rhl * Math.cos(degToRad(alhl1))
    const ylhl1 = this.y + rhl * Math.sin(degToRad(alhl1))
    const xlhl2 = this.x + rhl * Math.cos(degToRad(alhl2))
    const ylhl2 = this.y + rhl * Math.sin(degToRad(alhl2))

    const router = rhl + rcap
    const rinner = rhl - rcap

    ctx.arc(xlhl1, ylhl1, rcap, degToRad(alhl1 - 180), degToRad(alhl1))
    ctx.arc(this.x, this.y, router, degToRad(alhl1), degToRad(alhl2))
    ctx.arc(xlhl2, ylhl2, rcap, degToRad(alhl2), degToRad(alhl2 + 180))
    ctx.arc(this.x, this.y, rinner, degToRad(alhl2), degToRad(alhl1), true)

    ctx.stroke()
  }
}

/* Canvas Control */

function setupCanvasSize() {
  if ($canvas.value == null) return

  const w = props.width
  const h = props.height

  centerRadius = getCenterRadius(w, h)
  bubbleRadius = getBubbleRadius(w, h)
  const minCanvasWidth = centerRadius + bubbleRadius * 10
  canvasWidth = Math.max(w, minCanvasWidth)
  canvasHeight = h

  $canvas.value.style.width = `${canvasWidth}px`
  $canvas.value.style.height = `${canvasHeight}px`
}

function setupCanvasContext() {
  if ($canvas.value == null) return

  const ctx = $canvas.value.getContext('2d')
  if (ctx == null) return

  const dpr = window.devicePixelRatio || 1
  $canvas.value.width = canvasWidth * dpr
  $canvas.value.height = canvasHeight * dpr
  ctx.scale(dpr, dpr)

  setupWalls()
  setupCenterArea()
  resizeBubbles()

  return ctx
}

function renderContent(ctx: CanvasCtx) {
  renderBubbles(ctx)
  applyMask(ctx, bleedMask)
}

watch([
  () => props.width,
  () => props.height,
], () => {
  setupCanvasSize()
  const ctx = setupCanvasContext()
  if (ctx == null) return

  renderContent(ctx)
})

function getBubbleRadius(cw: number, ch: number) {
  const radius = clamp(
    Math.hypot(cw, ch) * BubbleRadiusRatio,
    BubbleMinRadius,
    BubbleMaxRadius,
  )

  return radius
}

/* Walls */

const WallExtraHeightRatio = 10
const WallThickness = 80

function getExtraRoom() {
  return bubbleRadius * 5
}

function setupWalls() {
  const wallExtraHeight = bubbleRadius * WallExtraHeightRatio
  const width = canvasWidth
  const height = canvasHeight
  const extraRoom = getExtraRoom()

  const extend = WallThickness + extraRoom
  const sideY = height - (height + wallExtraHeight) / 2
  const sideHeight = height + wallExtraHeight + extraRoom * 2

  const oldWalls = walls.splice(0, walls.length)
  Composite.remove(engine.world, oldWalls)

  const left = Bodies.rectangle(
    -extend / 2,
    sideY,
    WallThickness,
    sideHeight,
    { isStatic: true },
  )
  const right = Bodies.rectangle(
    width + extend / 2,
    sideY,
    WallThickness,
    sideHeight,
    { isStatic: true },
  )
  const bottom = Bodies.rectangle(
    width / 2,
    height + extend / 2,
    width + extend * 2,
    WallThickness,
    { isStatic: true },
  )

  walls.push(left, right, bottom)
  Composite.add(engine.world, walls)
}

/* Center Area */

function getCenterSpaceY() {
  return FooterBleed + (canvasHeight - FooterBleed) / 2
}

function setupCenterArea() {
  if (centerSpace != null) {
    Composite.remove(engine.world, centerSpace)
  }

  centerSpace = Bodies.circle(
    canvasWidth / 2,
    getCenterSpaceY(),
    centerRadius,
    { isStatic: true },
  )
  Composite.add(engine.world, centerSpace)
}

function _debugRenderCenterArea(ctx: CanvasCtx) {
  ctx.fillStyle = '#222'
  ctx.beginPath()
  ctx.arc(canvasWidth / 2, getCenterSpaceY(), centerRadius, 0, Math.PI * 2)
  ctx.fill()
}

/* Bubbles */

function resizeBubbles() {
  for (const bubble of bubbles) {
    const oldRadius = bubble.circleRadius ?? bubbleRadius
    const scale = bubbleRadius / oldRadius
    Body.scale(bubble, scale, scale)
  }
}

function renderBubbles(ctx: CanvasCtx) {
  // A simple y-sort.
  bubbles.sort((a, b) => {
    const diff = a.position.y - b.position.y
    if (Math.abs(diff) < bubbleRadius) return 0
    return diff
  })

  for (const body of bubbles) {
    const x = body.position.x
    const y = body.position.y
    const r = (body.circleRadius ?? BubbleMinRadius) * 1.2
    new Bubble(x, y, r).draw(ctx)
  }
}

function removeOutboundBubbles() {
  for (let i = bubbles.length - 1; i >= 0; i--) {
    const bubble = bubbles[i]
    const { x, y } = bubble.position
    const r = bubble.circleRadius ?? bubbleRadius
    const wallExtraHeight = bubbleRadius * WallExtraHeightRatio

    const isOutbound = x < -(r + WallThickness)
      || x > canvasWidth + r + WallThickness
      || y > canvasHeight + r + WallThickness
      || y < -wallExtraHeight

    if (!isOutbound) continue

    bubbles.splice(i, 1)
    Composite.remove(engine.world, bubble)
  }
}

function dropBubble() {
  if ($canvas.value == null) return

  const r = bubbleRadius
  const x = random(r, Math.max(r, canvasWidth - r), 2)
  const y = -random(r * 2, r * 8, 2)

  const bubble = Bodies.circle(x, y, r, {
    density: 0.00001,
    restitution: 0.6,
    frictionStatic: 0.25,
    frictionAir: 0.012,
  })

  // A small initial force to add randomness and dynamic.
  Body.applyForce(bubble, bubble.position, {
    x: random(-0.01, 0.01, 6) * bubble.mass,
    y: 0,
  })

  bubbles.push(bubble)
  Composite.add(engine.world, bubble)

  return bubble
}

function syncBubbleCount(delta: number) {
  const bubbleArea = bubbleRadius * bubbleRadius * 4
  const extraRoom = getExtraRoom()
  const canvasArea = (canvasWidth + extraRoom * 2) * (canvasHeight + extraRoom)
  const centerArea = centerRadius * centerRadius * 4

  const n = (canvasArea - centerArea) / bubbleArea
  bubbleCount = Math.min(Math.ceil(n), BubbleMaxCount)

  while (bubbles.length > bubbleCount) {
    const bubble = bubbles.pop()
    if (bubble == null) break

    Composite.remove(engine.world, bubble)
  }

  // If increasing the amount of bubble, add them one by one.
  if (bubbles.length >= bubbleCount) return
  dropTimer += delta

  if (dropTimer >= BubbleDropInterval) {
    dropTimer -= BubbleDropInterval
    dropBubble()
  }
}

/* Mask */

let bleedMask: CanvasGradient | null = null

function createBleedMask(ctx: CanvasCtx) {
  const gradient = ctx.createLinearGradient(0, 0, 0, FooterBleed)
  gradient.addColorStop(0, 'rgba(0, 0, 0, 1)')
  gradient.addColorStop(1, 'rgba(0, 0, 0, 0)')
  return gradient
}

function applyMask(ctx: CanvasCtx, mask: CanvasGradient | null) {
  if (mask == null) return

  ctx.save()
  ctx.globalCompositeOperation = 'destination-out'

  ctx.fillStyle = mask
  ctx.fillRect(0, 0, canvasWidth, FooterBleed)

  ctx.restore()
}

/* Pointer Interaction */

const MouseForceBase = 0.05
const MouseSpeedRatio = 0.02

let pointer: Vector | null = null
let pointerSpeed = 0
let pointerDown = false

function applyPointerForce() {
  if (pointer == null) return

  const rp = bubbleRadius * (pointerDown ? 8 : 2)
  const gain = pointerDown
    ? 2
    : clamp(pointerSpeed * MouseSpeedRatio, 0, 1)

  for (const bubble of bubbles) {
    const dx = bubble.position.x - pointer.x
    const dy = bubble.position.y - pointer.y
    const d = Math.hypot(dx, dy)

    if (d > rp || d === 0) continue

    const strength = 1 - d / rp
    const depth = clamp(bubble.position.y / canvasHeight, 0, 1)
    const f = MouseForceBase
      * strength
      * (1 + depth)
      * gain
      * bubble.mass

    const fx = dx / d * f
    // Only retains the force to raise the bubbles.
    const fy = Math.min(dy / d * f, 0)

    Body.applyForce(bubble, bubble.position, Vector.create(fx, fy))
  }

  // Consume pointer states.
  pointerSpeed = 0
  pointerDown = false
}

function getRelativePosition(event: PointerEvent) {
  const canvas = $canvas.value
  if (canvas == null) return

  const rect = canvas.getBoundingClientRect()
  const x = event.clientX - rect.left
  const y = event.clientY - rect.top

  return { x, y }
}

function onPointerMove(event: PointerEvent) {
  const position = getRelativePosition(event)
  if (position == null) return
  const { x, y } = position

  if (pointer != null) {
    pointerSpeed = Math.hypot(x - pointer.x, y - pointer.y)
  }

  pointer = Vector.create(x, y)
}

function onPointerLeave() {
  pointer = null
}

function onPointerDown(event: PointerEvent) {
  const position = getRelativePosition(event)
  if (position == null) return
  const { x, y } = position

  pointer = Vector.create(x, y)
  pointerDown = true
}

useEventListener('pointermove', onPointerMove)
useEventListener('pointerleave', onPointerLeave)
useEventListener('pointerdown', onPointerDown)

/* Main Loop */

onMounted(() => {
  const canvas = $canvas.value
  if (canvas == null) return

  const ctx = canvas.getContext('2d')
  if (ctx == null) return

  setupCanvasSize()
  bleedMask = createBleedMask(ctx)

  timer = createTimer({
    frameRate: 60,
    autoplay: false,
    loop: true,
    onUpdate: ({ deltaTime }) => {
      const delta = Math.max(deltaTime, 0)

      applyPointerForce()
      Engine.update(engine, delta)
      removeOutboundBubbles()
      syncBubbleCount(delta)

      ctx.clearRect(0, 0, canvas.width, canvas.height)
      renderContent(ctx)
    },
  })

  let activationWatcher = watch(() => props.activate, (val) => {
    if (val) {
      timer?.play()
      activationWatcher.stop()
    }
  }, { immediate: true })

  watch(canvasVisible, (val) => {
    if (val) {
      timer?.resume()
    } else {
      timer?.pause()
    }
  }, { immediate: true })
})

onBeforeUnmount(() => {
  timer?.cancel()
  timer = null
})
</script>

<template>
  <canvas ref="$canvas" class="footer-spheres"></canvas>
</template>

<style scoped lang="scss">
.footer-spheres {
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  max-width: fit-content;
  z-index: -8;
}
</style>
