<script setup lang="ts">
import { createTimer, eases, type Timer } from 'animejs'
import { range } from 'remeda'
import { onBeforeUnmount, onMounted, useTemplateRef } from 'vue'

const $canvas = useTemplateRef<HTMLCanvasElement>('$canvas')
type CanvasContext = CanvasRenderingContext2D

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
const ColorEnd = 0x60

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

interface Wave {
  update(): void
  draw(ctx: CanvasContext): void
}

function createWave(options: WaveOptions): Wave {
  const {
    components,
    color,
  } = options

  let time = 0

  const calcY = (x: number) => {
    let yOffset = 0
    for (const sine of components) {
      const f = (x - time * sine.speed) / sine.wl
      yOffset += sine.amp * Math.sin(2 * Math.PI * f + sine.phase)
    }

    const p = x / DesignWidth
    const shape = 1 - eases.inSine(p)
    return WaveBaseline + yOffset * shape
  }

  return {
    update() {
      time += 1
    },
    draw(ctx) {
      ctx.beginPath()
      ctx.strokeStyle = color

      let x = 0
      let y = calcY(x)
      ctx.moveTo(x, y)

      while (x <= DesignWidth) {
        const y = calcY(x)
        ctx.lineTo(x, y)

        x += WaveSampleStep
      }

      ctx.stroke()
    },
  }
}

function randomPhase() {
  return 2 * Math.PI * Math.random()
}

function randomSpread(base: number, spread: number) {
  return base * (1 + spread * (Math.random() * 2 - 1))
}

function generateWaves() {
  const waves: Wave[] = []

  for (const i of range(0, WaveCount)) {
    const p = WaveCount > 1 ? i / (WaveCount - 1) : 0
    const channel = Math.round(ColorBegin + (ColorEnd - ColorBegin) * p)

    const baseAmp = WaveMaxAmp * (1 - 0.6 * p)
    const baseWl = 400 + 400 * p
    const baseSpeed = 1 + 0.5 * p

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

    waves.push(createWave({
      components,
      color: `rgb(${channel}, ${channel}, ${channel})`,
    }))
  }

  return waves
}

let waves: Wave[] = []
let timer: Timer | null = null

function createMaskV(ctx: CanvasContext) {
  const gradient = ctx.createLinearGradient(0, FadeOutTop, 0, DesignHeight)
  gradient.addColorStop(0, 'rgba(0, 0, 0, 0)')
  gradient.addColorStop(1, 'rgba(0, 0, 0, 1)')
  return gradient
}

function createMaskH(ctx: CanvasContext) {
  const gradient = ctx.createLinearGradient(FadeOutRight, 0, DesignWidth, 0)
  gradient.addColorStop(0, 'rgba(0, 0, 0, 0)')
  gradient.addColorStop(1, 'rgba(0, 0, 0, 1)')
  return gradient
}

function applyMask(ctx: CanvasContext, gradient: CanvasGradient) {
  ctx.save()
  ctx.globalCompositeOperation = 'destination-out'
  ctx.fillStyle = gradient
  ctx.fillRect(0, 0, DesignWidth, DesignHeight)
  ctx.restore()
}

function setupCanvas(canvas: HTMLCanvasElement) {
  const ctx = canvas.getContext('2d')
  if (!ctx) return null

  const dpr = window.devicePixelRatio ?? 1
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

  waves = generateWaves()
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

      applyMask(ctx, maskV)
      applyMask(ctx, maskH)
    },
  })
})

onBeforeUnmount(() => {
  timer?.cancel()
})
</script>

<template>
  <canvas ref="$canvas"></canvas>
</template>
