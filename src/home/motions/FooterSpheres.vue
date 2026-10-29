<script setup lang="ts">
import { useResizeObserver } from '@vueuse/core'
import { clamp, createTimer, degToRad, radToDeg, random, type Timer } from 'animejs'
import { Bodies, Body, Composite, Engine } from 'matter-js'
import { onBeforeUnmount, onMounted, useTemplateRef } from 'vue'

type CanvasCtx = CanvasRenderingContext2D

const $container = useTemplateRef('$container')
const $canvas = useTemplateRef('$canvas')

const BubbleCoverRatio = 0.5
const BubbleDropInterval = 50
const BubbleMaxCount = 100
const BubbleMinRadius = 50
const BubbleMaxRadius = 80

const engine: Engine = Engine.create()
const walls: Body[] = []
const bubbles: Body[] = []

let canvasWidth = 0
let canvasHeight = 0
let bubbleRadius = BubbleMinRadius
let bubbleCount = 0
let dropTimer = 0
let timer: Timer | null = null

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
    // Base.
    ctx.beginPath()
    ctx.arc(this.x, this.y, this.r, 0, 2 * Math.PI)
    ctx.fill()

    // Outer circle.
    ctx.beginPath()
    ctx.arc(this.x, this.y, this.r, 0, 2 * Math.PI * 2)
    ctx.stroke()

    const rhl = this.r - 12
    const rcap = 4

    // Small highlight.
    ctx.beginPath()

    const ashl = -70
    const xshl = this.x + rhl * Math.cos(degToRad(ashl))
    const yshl = this.y + rhl * Math.sin(degToRad(ashl))

    ctx.arc(xshl, yshl, rcap, 0, 2 * Math.PI)
    ctx.stroke()

    // Large highlight.
    ctx.beginPath()

    const alhl1 = ashl + radToDeg(14 / rhl)
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

function syncCanvasSize() {
  if ($container.value == null || $canvas.value == null) return

  canvasWidth = $container.value.scrollWidth
  canvasHeight = $container.value.scrollHeight
  $canvas.value.style.width = `${canvasWidth}px`
  $canvas.value.style.height = `${canvasHeight}px`
}

useResizeObserver($container, syncCanvasSize)

useResizeObserver($canvas, ([entry]) => {
  if ($canvas.value == null) return

  const ctx = $canvas.value.getContext('2d')
  if (ctx == null) return

  // Setup canvas size.
  const dpr = window.devicePixelRatio || 1
  const { width, height } = entry.contentRect
  $canvas.value.width = width * dpr
  $canvas.value.height = height * dpr

  // Setup styles.
  ctx.strokeStyle = '#eee'
  ctx.lineWidth = 2
  ctx.lineJoin = 'round'
  ctx.fillStyle = '#222'
  ctx.scale(dpr, dpr)

  bubbleRadius = getBubbleRadius()
  setupWalls()
  resizeBubbles()

  renderBubbles(ctx)
})

function getBubbleRadius() {
  const ratio = 10
  return clamp(
    Math.min(canvasWidth, canvasHeight) / ratio,
    BubbleMinRadius,
    BubbleMaxRadius,
  )
}

const wallExtraHeight = 600
const wallThickness = 60

function setupWalls() {
  const width = canvasWidth
  const height = canvasHeight
  const bleed = bubbleRadius
  const extent = wallThickness + bleed

  const y = height - (height + wallExtraHeight) / 2

  const oldWalls = walls.splice(0, walls.length)
  Composite.remove(engine.world, oldWalls)

  const left = Bodies.rectangle(
    -extent / 2,
    y,
    wallThickness,
    (height + wallExtraHeight + bleed) * 2,
    { isStatic: true },
  )
  const right = Bodies.rectangle(
    width + extent / 2,
    y,
    wallThickness,
    (height + wallExtraHeight + bleed) * 2,
    { isStatic: true },
  )
  const bottom = Bodies.rectangle(
    width / 2,
    height + extent / 2,
    width + extent * 2,
    wallThickness,
    { isStatic: true },
  )

  walls.push(left, right, bottom)
  Composite.add(engine.world, walls)
}

function resizeBubbles() {
  for (const bubble of bubbles) {
    const oldRadius = bubble.circleRadius ?? bubbleRadius
    const scale = bubbleRadius / oldRadius
    Body.scale(bubble, scale, scale)
  }
}

function renderBubbles(ctx: CanvasCtx) {
  // Y-sort.
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

onMounted(() => {
  const canvas = $canvas.value
  if (canvas == null) return

  syncCanvasSize()

  timer = createTimer({
    frameRate: 60,
    loop: true,
    onUpdate: ({ deltaTime }) => {
      const delta = Math.max(deltaTime, 0)
      Engine.update(engine, delta)
      removeOutboundBubbles()
      syncBubbleCount(delta)

      const ctx = canvas.getContext('2d')
      if (ctx == null) return

      ctx.clearRect(0, 0, canvas.width, canvas.height)
      renderBubbles(ctx)
    },
  })
})

onBeforeUnmount(() => {
  timer?.cancel()
  timer = null
})

function removeOutboundBubbles() {
  for (let i = bubbles.length - 1; i >= 0; i--) {
    const bubble = bubbles[i]
    const { x, y } = bubble.position
    const r = bubble.circleRadius ?? bubbleRadius

    const isOutbound = x < -(r + wallThickness)
      || x > canvasWidth + r + wallThickness
      || y > canvasHeight + r + wallThickness
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
  const y = -random(r, r * 3, 2)

  const bubble = Bodies.circle(x, y, r, { restitution: 0.8 })

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
  const bubbleArea = Math.PI * bubbleRadius * bubbleRadius
  const area = canvasWidth * canvasHeight * BubbleCoverRatio

  bubbleCount = Math.min(Math.ceil(area / bubbleArea), BubbleMaxCount)

  while (bubbles.length > bubbleCount) {
    const bubble = bubbles.pop()
    if (bubble == null) break

    Composite.remove(engine.world, bubble)
  }

  if (bubbles.length >= bubbleCount) return
  dropTimer += delta

  if (dropTimer >= BubbleDropInterval) {
    dropTimer -= BubbleDropInterval
    dropBubble()
  }
}
</script>

<template>
  <div ref="$container" class="footer-spheres">
    <canvas ref="$canvas" class="canvas"></canvas>
  </div>
</template>

<style scoped lang="scss">
.footer-spheres {
  position: absolute;
  inset: 0;
  z-index: -8;

  > .canvas {
    position: absolute;
    left: 50%;
    top: 50%;
    transform: translate(-50%, -50%);
  }
}
</style>
