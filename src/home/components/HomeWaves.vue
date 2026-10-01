<script setup lang="ts">
import { useElementVisibility } from '@vueuse/core'
import { createTimer, eases, lerp, type Timer } from 'animejs'
import { range } from 'remeda'
import { onBeforeUnmount, onMounted, useTemplateRef, watch } from 'vue'

type CanvasCtx = CanvasRenderingContext2D

const $canvas = useTemplateRef<HTMLCanvasElement>('$canvas')
const canvasVisible = useElementVisibility($canvas)

const DesignWidth = 640
const DesignHeight = 800

const WaveLineWidth = 4
const WaveCount = 8
const WaveBaseline = 720
const WaveMaxAmp = 700
const WaveSampleStep = 4
const FadeOutTop = 680
const FadeOutRight = 560

const ColorBegin = 0x40
const ColorEnd = 0x66

interface WaveComponent {
  wl: number
  amp: number
  speed: number
  phase: number
}

interface WaveOptions {
  components: WaveComponent[]
  color: string
}

class Wave {
  private components: WaveComponent[]
  private color: string
  private time = 0

  constructor(options: WaveOptions) {
    this.components = options.components
    this.color = options.color
  }

  private calcY(x: number) {
    let yOffset = 0
    for (const sine of this.components) {
      const f = (x - this.time * sine.speed) / sine.wl
      yOffset += sine.amp * Math.sin(2 * Math.PI * f + sine.phase)
    }

    const step = x / DesignWidth
    const shape = 1 - eases.inSine(step)
    return WaveBaseline + yOffset * shape
  }

  draw(ctx: CanvasCtx) {
    ctx.beginPath()
    ctx.strokeStyle = this.color

    let x = 0
    let y0 = this.calcY(x)
    ctx.moveTo(x, y0)

    while (x <= DesignWidth) {
      const y = this.calcY(x)
      ctx.lineTo(x, y)

      x += WaveSampleStep
    }

    ctx.stroke()
  }

  update() {
    this.time++
  }
}

function randomPhase() {
  return 2 * Math.PI * Math.random()
}

function randomSpread(base: number, spread: number) {
  return base * (1 + spread * (Math.random() * 2 - 1))
}

function generateWaves(): Wave[] {
  const waves: Wave[] = []

  for (const i of range(0, WaveCount)) {
    const step = WaveCount > 1 ? i / (WaveCount - 1) : 0
    const channel = Math.round(lerp(ColorBegin, ColorEnd, step))

    const baseAmp = WaveMaxAmp * (1 - 0.6 * step)
    const baseWl = 400 + 400 * step
    const baseSpeed = 1 + 0.5 * step

    const ampsRatio: number[] = [1]
    const subWaveCount = 4

    for (const j of range(0, subWaveCount)) {
      const dt = (j + 1) / subWaveCount
      ampsRatio.push(randomSpread(0.8 - 0.6 * dt, 0.05))
    }

    const peak = ampsRatio.reduce((sum, amp) => sum + amp, 0)
    const components: WaveComponent[] = []

    for (const j of range(0, 1 + subWaveCount)) {
      const t = j / subWaveCount

      components.push({
        amp: baseAmp * ampsRatio[j] / peak,
        wl: baseWl * randomSpread(1 - 0.6 * t, 0.1),
        speed: baseSpeed * randomSpread(1 + 1.2 * t, 0.2),
        phase: randomPhase(),
      })
    }

    waves.push(
      new Wave({
        components,
        color: `rgb(${channel}, ${channel}, ${channel})`,
      }),
    )
  }

  return waves
}

let timer: Timer | null = null

function createMaskV(ctx: CanvasCtx) {
  const gradient = ctx.createLinearGradient(0, FadeOutTop, 0, DesignHeight)
  gradient.addColorStop(0, 'rgba(0, 0, 0, 0)')
  gradient.addColorStop(1, 'rgba(0, 0, 0, 1)')
  return gradient
}

function createMaskH(ctx: CanvasCtx) {
  const gradient = ctx.createLinearGradient(FadeOutRight, 0, DesignWidth, 0)
  gradient.addColorStop(0, 'rgba(0, 0, 0, 0)')
  gradient.addColorStop(1, 'rgba(0, 0, 0, 1)')
  return gradient
}

function applyMasks(ctx: CanvasCtx, maskV: CanvasGradient, maskH: CanvasGradient) {
  ctx.save()
  ctx.globalCompositeOperation = 'destination-out'

  ctx.fillStyle = maskV
  ctx.fillRect(0, 0, DesignWidth, DesignHeight)

  ctx.fillStyle = maskH
  ctx.fillRect(0, 0, DesignWidth, DesignHeight)

  ctx.restore()
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
  ctx.lineWidth = WaveLineWidth
  ctx.lineJoin = 'round'

  return ctx
}

onMounted(() => {
  const canvas = $canvas.value
  if (!canvas) return

  const ctx = setupCanvas(canvas)
  if (!ctx) return

  const waves = generateWaves()
  const maskV = createMaskV(ctx)
  const maskH = createMaskH(ctx)

  timer = createTimer({
    frameRate: 60,
    loop: true,
    onUpdate: () => {
      ctx.clearRect(0, 0, DesignWidth, DesignHeight)

      for (const wave of waves) {
        wave.update()
        wave.draw(ctx)
      }

      applyMasks(ctx, maskV, maskH)
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
