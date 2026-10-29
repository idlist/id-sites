<script setup lang="ts">
import { useResizeObserver } from '@vueuse/core'
import { clamp, createTimer, degToRad, radToDeg, type Timer } from 'animejs'
import { Bodies, Body, Composite, Engine } from 'matter-js'
import { onBeforeUnmount, onMounted, useTemplateRef } from 'vue'

type CanvasCtx = CanvasRenderingContext2D

const $container = useTemplateRef('$container')
const $canvas = useTemplateRef('$canvas')

const BubbleCount = 20
const BubbleMinRadius = 50
const BubbleMaxRadius = 80

const engine: Engine = Engine.create()
const walls: Body[] = []
const bubbles: Body[] = []

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

useResizeObserver($container, ([entry]) => {
  if ($canvas.value == null) return

  const { width, height } = entry.contentRect
  $canvas.value.style.width = `${width}px`
  $canvas.value.style.height = `${height}px`
})

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
  setupCanvasStyles(ctx)

  const radius = getBubbleRadius(width, height)
  setupWalls(width, height, radius)
  resizeBubbles(radius)

  renderBubbles(ctx)
})

function setupCanvasStyles(ctx: CanvasCtx) {
  ctx.strokeStyle = '#eee'
  ctx.lineWidth = 2
  ctx.lineJoin = 'round'
  ctx.fillStyle = '#222'
}

function getBubbleRadius(width: number, height: number) {
  const ratio = 10
  return clamp(Math.min(width, height) / ratio, BubbleMinRadius, BubbleMaxRadius)
}

function setupWalls(width: number, height: number, radius: number) {
  const thickness = 60
  const bleed = radius
  const extent = thickness + bleed

  const oldWalls = walls.splice(0, walls.length)
  Composite.remove(engine.world, oldWalls)

  const left = Bodies.rectangle(
    -extent / 2,
    0,
    thickness,
    (height + bleed) * 2,
    { isStatic: true },
  )
  const right = Bodies.rectangle(
    width + extent / 2,
    0,
    thickness,
    (height + bleed) * 2,
    { isStatic: true },
  )
  const bottom = Bodies.rectangle(
    width / 2,
    height + extent / 2,
    width + extent * 2,
    thickness,
    { isStatic: true },
  )

  walls.push(left, right, bottom)
  Composite.add(engine.world, walls)
}

function resizeBubbles(radius: number) {
  for (const bubble of bubbles) {
    const currentRadius = bubble.circleRadius ?? radius
    const scale = radius / currentRadius
    Body.scale(bubble, scale, scale)
  }
}

function renderBubbles(ctx: CanvasCtx) {
  for (const body of bubbles) {
    const x = body.position.x
    const y = body.position.y
    const r = (body.circleRadius ?? BubbleMinRadius) * 1.2
    new Bubble(x, y, r).draw(ctx)
  }
}

function setupBubbles() {
  if (bubbles.length > 0) return

  const radius = BubbleMinRadius

  for (let i = 0; i < BubbleCount; i++) {
    const x = radius + (i % 4) * radius * 2
    const y = radius + Math.floor(i / 4) * radius * 2
    bubbles.push(Bodies.circle(x, y, radius, { restitution: 0.6 }))
  }

  Composite.add(engine.world, bubbles)
}

onMounted(() => {
  const canvas = $canvas.value
  if (canvas == null) return

  setupBubbles()

  timer = createTimer({
    loop: true,
    onUpdate: ({ deltaTime }) => {
      Engine.update(engine, deltaTime)

      const ctx = canvas.getContext('2d')
      if (ctx == null) return

      const dpr = window.devicePixelRatio || 1
      ctx.setTransform(1, 0, 0, 1, 0, 0)
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)

      renderBubbles(ctx)
    },
  })
})

onBeforeUnmount(() => {
  timer?.cancel()
  timer = null
})
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
