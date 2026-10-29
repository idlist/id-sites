<script setup lang="ts">
import { useResizeObserver } from '@vueuse/core'
import { degToRad } from 'animejs'
import { Bodies, Engine, Render, Runner } from 'matter-js'
import { useTemplateRef } from 'vue'

type CanvasCtx = CanvasRenderingContext2D

const $container = useTemplateRef('$container')
const $canvas = useTemplateRef('$canvas')

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
    ctx.arc(this.x, this.y, this.r - 4, 0, 2 * Math.PI)
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

    const alhl1 = -52
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
  if (!$canvas.value) return

  const { width, height } = entry.contentRect
  $canvas.value.style.width = `${width}px`
  $canvas.value.style.height = `${height}px`
})

useResizeObserver($canvas, ([entry]) => {
  if (!$canvas.value) return

  const ctx = $canvas.value.getContext('2d')
  if (!ctx) return

  const dpr = window.devicePixelRatio || 1
  const { width, height } = entry.contentRect
  $canvas.value.width = width * dpr
  $canvas.value.height = height * dpr
  ctx.scale(dpr, dpr)

  ctx.strokeStyle = '#eee'
  ctx.lineWidth = 2
  ctx.lineJoin = 'round'
  ctx.fillStyle = '#333'

  new Bubble(60, 60, 60).draw(ctx)
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
