<script setup lang="ts">
import { useElementVisibility } from '@vueuse/core'
import { createTimer, degToRad, eases, random, type Timer } from 'animejs'
import { Vector } from 'matter-js'
import { clone, range } from 'remeda'
import { onBeforeUnmount, onMounted, useTemplateRef, watch } from 'vue'

const props = defineProps<{
  width: number
  height: number
}>()

type CanvasContext = CanvasRenderingContext2D

const $canvas = useTemplateRef('$canvas')
const canvasVisible = useElementVisibility($canvas)
const stars = new Map<number, BaseStar>()

/* Canvas Control */

function setupCanvasSize() {
  if ($canvas.value == null) return

  $canvas.value.style.width = `${props.width}px`
  $canvas.value.style.height = `${props.height}px`
}

function setupCanvasContext() {
  if ($canvas.value == null) return

  const ctx = $canvas.value.getContext('2d')
  if (ctx == null) return

  const dpr = Math.min(window.devicePixelRatio || 1, 2)
  $canvas.value.width = props.width * dpr
  $canvas.value.height = props.height * dpr
  ctx.scale(dpr, dpr)

  ctx.strokeStyle = '#ccc'
  ctx.lineWidth = 2
  ctx.lineJoin = 'round'

  return ctx
}

watch([
  () => props.width,
  () => props.height,
], () => {
  setupCanvasSize()
  const ctx = setupCanvasContext()
  if (ctx == null) return

  renderStars(ctx)
})

/* Stars */

interface StarOptions {
  x: number
  y: number
  outer: number
  duration: number
}

interface StarRayOptions extends StarOptions {
  rays?: number
  inner?: number
}

abstract class BaseStar {
  protected x: number
  protected y: number
  protected radius: number
  protected duration: number

  protected timeElapsed: number = 0

  constructor(options: StarRayOptions) {
    this.x = options.x
    this.y = options.y
    this.radius = options.outer
    this.duration = options.duration
  }

  update(delta: number) {
    this.timeElapsed += delta
  }

  expired() {
    return this.timeElapsed > this.duration
  }

  abstract draw(ctx: CanvasContext): void
}

class StarRay extends BaseStar {
  private rays: number
  private inner: number

  private angleOffset = 0
  private static easeOut = eases.out(2.5)

  constructor(options: StarRayOptions) {
    super(options)
    this.rays = options.rays ?? 4
    this.inner = options.inner ?? 0

    this.angleOffset = this.rays === 8 ? Math.PI / 8 : 0
  }

  draw(ctx: CanvasContext) {
    const t = this.timeElapsed / this.duration
    const cp = 0.4

    if (t < cp) {
      const p = t / cp
      this.spread(ctx, StarRay.easeOut(p))
    } else {
      const p = (t - cp) / (1 - cp)
      this.dissipate(ctx, StarRay.easeOut(p))
    }
  }

  private drawRay(ctx: CanvasContext, a: number, d1: number, d2: number) {
    const x1 = this.x + d1 * Math.cos(a)
    const y1 = this.y + d1 * Math.sin(a)
    const x2 = this.x + d2 * Math.cos(a)
    const y2 = this.y + d2 * Math.sin(a)

    ctx.beginPath()
    ctx.moveTo(x1, y1)
    ctx.lineTo(x2, y2)
    ctx.stroke()
  }

  private spread(ctx: CanvasContext, p: number) {
    for (const i of range(0, this.rays)) {
      const a = this.angleOffset + 2 * Math.PI * i / this.rays

      const d1 = this.inner
      const d2 = this.inner + (this.radius - this.inner) * p

      this.drawRay(ctx, a, d1, d2)
    }
  }

  private dissipate(ctx: CanvasContext, p: number) {
    for (const i of range(0, this.rays)) {
      const a = this.angleOffset + 2 * Math.PI * i / this.rays

      const d1 = this.radius - (this.radius - this.inner) * (1 - p)
      const d2 = this.radius

      this.drawRay(ctx, a, d1, d2)
    }
  }
}

class StarFourPoints extends BaseStar {
  private design: Vector[]
  private static easeOut = eases.out(2.5)

  constructor(options: StarOptions) {
    super(options)
    this.design = this.designPoint()
  }

  private designPoint(): Vector[] {
    const spreadAngle = degToRad(15)
    const innerAngle = degToRad(45)
    const outerAngle = Math.PI - spreadAngle - innerAngle

    // Sine theorem.
    const ratio = this.radius / Math.sin(outerAngle)
    const d = ratio * Math.sin(spreadAngle)

    const x = d * Math.cos(innerAngle)
    const ya = d * Math.sin(innerAngle)
    const yb = -ya

    return [
      Vector.create(x, ya),
      Vector.create(this.radius, 0),
      Vector.create(x, yb),
      Vector.create(this.radius, 0),
    ]
  }

  draw(ctx: CanvasContext) {
    const t = this.timeElapsed / this.duration
    const cp = 0.4

    if (t < cp) {
      const p = t / cp
      this.spread(ctx, StarFourPoints.easeOut(p))
    } else {
      const p = (t - cp) / (1 - cp)
      this.dissipate(ctx, StarFourPoints.easeOut(p))
    }
  }

  private drawPoint(ctx: CanvasContext, points: Vector[]) {
    ctx.beginPath()
    ctx.moveTo(this.x + points[0].x, this.y + points[0].y)
    ctx.lineTo(this.x + points[1].x, this.y + points[1].y)
    ctx.stroke()

    ctx.beginPath()
    ctx.moveTo(this.x + points[2].x, this.y + points[2].y)
    ctx.lineTo(this.x + points[3].x, this.y + points[3].y)
    ctx.stroke()
  }

  private lerp(start: Vector, end: Vector, p: number) {
    return Vector.add(start, Vector.mult(Vector.sub(end, start), p))
  }

  private spread(ctx: CanvasContext, p: number) {
    const points = [
      this.design[0],
      this.lerp(this.design[0], this.design[1], p),
      this.design[2],
      this.lerp(this.design[2], this.design[3], p),
    ]

    for (const i of range(0, 4)) {
      const a = 2 * Math.PI * i / 4
      const rotated = points.map((point) => Vector.rotate(point, a))
      this.drawPoint(ctx, rotated)
    }
  }

  private dissipate(ctx: CanvasContext, p: number) {
    const points = [
      this.lerp(this.design[0], this.design[1], p),
      this.design[1],
      this.lerp(this.design[2], this.design[3], p),
      this.design[3],
    ]

    for (const i of range(0, 4)) {
      const a = 2 * Math.PI * i / 4
      const rotated = points.map((point) => Vector.rotate(point, a))
      this.drawPoint(ctx, rotated)
    }
  }
}

const Padding = 32
const MinRadius = 8
const MaxRadius = 20
const MinDuration = 1000
const MaxDuration = 1500

const IntervalCoefMean = 150
const IntervalCoefSpread = 50
let createInterval = 0
let createTimeElapsed = 0
let starId = 0

function createStar(delta: number) {
  createTimeElapsed += delta
  if (createTimeElapsed < createInterval) return

  createTimeElapsed -= createInterval
  const areaCoef = Math.hypot(props.width, props.height) * 0.001
  createInterval = random(
    IntervalCoefMean - IntervalCoefSpread,
    IntervalCoefMean + IntervalCoefSpread,
    2,
  ) / areaCoef

  const outer = random(MinRadius, MaxRadius, 2)
  const duration = random(MinDuration, MaxDuration)
  const boundary = Padding + outer

  const hw = props.width / 2
  const xSign = Math.random() < 0.5 ? -1 : 1
  const xRatio = eases.out(2)(Math.random())
  const x = xSign * xRatio * (hw - boundary) + hw
  const y = random(boundary, props.height - boundary)

  if (Math.random() < 0.25) {
    const star = new StarFourPoints({ x, y, outer, duration })
    stars.set(starId, star)
  } else {
    let rays = 4
    let inner = outer * random(0.3, 0.5, 4)

    if (outer > 12 && Math.random() < 0.25) {
      rays = 6
      inner = outer * random(0.4, 0.6, 4)
    }
    if (outer > 16 && Math.random() < 0.25) {
      rays = 8
      inner = outer * random(0.5, 0.7, 4)
    }

    const star = new StarRay({ x, y, outer, inner, rays, duration })
    stars.set(starId, star)
  }

  starId++
}

function updateStars(delta: number) {
  for (const id of stars.keys()) {
    const star = stars.get(id)!
    star.update(delta)

    if (star.expired()) {
      stars.delete(id)
    }
  }
}

function renderStars(ctx: CanvasContext) {
  for (const star of stars.values()) {
    star.draw(ctx)
  }
}

/* Main Loop */

let timer: Timer | null = null

onMounted(() => {
  const canvas = $canvas.value
  if (canvas == null) return

  setupCanvasSize()
  const ctx = setupCanvasContext()
  if (ctx == null) return

  timer = createTimer({
    frameRate: 60,
    autoplay: false,
    loop: true,
    onUpdate: ({ deltaTime }) => {
      const delta = Math.max(deltaTime, 0)

      updateStars(delta)
      createStar(delta)

      ctx.clearRect(0, 0, canvas.width, canvas.height)
      renderStars(ctx)
    },
  })

  watch(canvasVisible, (visible) => {
    if (visible) {
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
  <canvas class="id-canvas-background" ref="$canvas"></canvas>
</template>
