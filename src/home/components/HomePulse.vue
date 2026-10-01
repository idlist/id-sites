<script setup lang="ts">
import { useElementVisibility } from '@vueuse/core'
import { createTimer, lerp, type Timer } from 'animejs'
import { range } from 'remeda'
import { onBeforeUnmount, onMounted, useTemplateRef, watch } from 'vue'

type CanvasCtx = CanvasRenderingContext2D

const $canvas = useTemplateRef<HTMLCanvasElement>('$canvas')
const canvasVisible = useElementVisibility($canvas)

const DesignWidth = 400
const DesignHeight = 200
const PulseFreq = 0.003
const PulseRange = 2

const ColorBegin = 0x33
const ColorEnd = 0x80

interface PulseOptions {
  xOffset: number
  yOffset: number
  lineWidth: number
  linePulseOffset: number
  color: string
}

class Pulse {
  private xOffset: number
  private yOffset: number
  private lineWidth: number
  private linePulseOffset: number
  private color: string
  private time = 0

  constructor(options: PulseOptions) {
    this.xOffset = options.xOffset
    this.yOffset = options.yOffset
    this.lineWidth = options.lineWidth
    this.linePulseOffset = options.linePulseOffset
    this.color = options.color
  }

  private getBezierPointsTip(x: number, y: number, l: number, a: number) {
    const r = (a * Math.PI) / 180
    const cx = x + Math.cos(r) * l
    const cy = y + Math.sin(r) * l
    return { x, y, cx, cy }
  }

  private getBezierPointsSmooth(x: number, y: number, l1: number, l2: number, a: number) {
    const r0 = (a * Math.PI) / 180
    const r1 = r0 + Math.PI
    const cx0 = x + Math.cos(r0) * l1
    const cy0 = y + Math.sin(r0) * l1
    const cx1 = x + Math.cos(r1) * l2
    const cy1 = y + Math.sin(r1) * l2
    return { x, y, cx0, cy0, cx1, cy1 }
  }

  draw(ctx: CanvasCtx) {
    ctx.translate(this.xOffset, this.yOffset)
    ctx.strokeStyle = this.color

    const omega = 2 * Math.PI * PulseFreq * this.time
    const lwOffset = Math.sin(omega + this.linePulseOffset)
    ctx.lineWidth = this.lineWidth + lwOffset * PulseRange

    const p0 = this.getBezierPointsTip(-80, -20, 160, 5)
    const p1 = this.getBezierPointsSmooth(180, 90, 100, 160, -170)
    const p2 = this.getBezierPointsTip(440, 180, 160, -175)

    ctx.beginPath()
    ctx.moveTo(p0.x, p0.y)
    ctx.bezierCurveTo(p0.cx, p0.cy, p1.cx0, p1.cy0, p1.x, p1.y)
    ctx.bezierCurveTo(p1.cx1, p1.cy1, p2.cx, p2.cy, p2.x, p2.y)
    ctx.stroke()

    ctx.translate(-this.xOffset, -this.yOffset)
  }

  update() {
    this.time++
  }
}

function generatePulses(): Pulse[] {
  const pulses: Pulse[] = []
  const lineCount = 12

  for (const i of range(0, lineCount)) {
    const step = (i + 1) / lineCount // Intentinoal.
    const channel = Math.round(lerp(ColorBegin, ColorEnd, step))

    const maxLineWidth = 18
    const disp = i * 16
    const angle = -60

    let lineWidth = 4 + i * 1.5
    if (lineWidth > maxLineWidth) lineWidth = maxLineWidth

    const r = angle / 180 * Math.PI
    const xOffset = r + Math.cos(r) * disp
    const yOffset = r + Math.sin(r) * disp

    pulses.push(
      new Pulse({
        xOffset,
        yOffset,
        lineWidth,
        linePulseOffset: Math.PI * 1.5 * step,
        color: `rgb(${channel}, ${channel}, ${channel})`,
      }),
    )
  }

  return pulses
}

function setupCanvas(canvas: HTMLCanvasElement) {
  const ctx = canvas.getContext('2d')
  if (!ctx) return null

  const dpr = window.devicePixelRatio || 1
  canvas.width = DesignWidth * dpr
  canvas.height = DesignHeight * dpr
  canvas.style.width = `${DesignWidth}px`
  canvas.style.height = `${DesignHeight}px`

  ctx.scale(dpr, dpr)
  return ctx
}

let timer: Timer | null = null

onMounted(() => {
  const canvas = $canvas.value
  if (!canvas) return

  const ctx = setupCanvas(canvas)
  if (!ctx) return

  const pulses = generatePulses()

  timer = createTimer({
    frameRate: 60,
    loop: true,
    onUpdate: () => {
      ctx.clearRect(0, 0, DesignWidth, DesignHeight)

      for (const pulse of pulses) {
        pulse.update()
        pulse.draw(ctx)
      }
    },
  })
})

watch(canvasVisible, (val) => {
  if (val) {
    timer?.resume()
  } else {
    timer?.pause()
  }
}, { immediate: true })

onBeforeUnmount(() => {
  timer?.cancel()
})
</script>

<template>
  <canvas ref="$canvas"></canvas>
</template>
