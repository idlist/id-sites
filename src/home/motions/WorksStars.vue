<script setup lang="ts">
import { useElementVisibility } from '@vueuse/core'
import { createTimer, type Timer } from 'animejs'
import { onBeforeUnmount, onMounted, useTemplateRef, watch } from 'vue'

const props = defineProps<{
  width: number
  height: number
}>()

type CanvasCtx = CanvasRenderingContext2D

const $canvas = useTemplateRef('$canvas')
const canvasVisible = useElementVisibility($canvas)

let timer: Timer | null = null

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

  return ctx
}

function renderContent(_ctx: CanvasCtx) {
  // TODO: Implement rendering.
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

/* Main Loop */

onMounted(() => {
  const canvas = $canvas.value
  if (canvas == null) return

  const ctx = canvas.getContext('2d')
  if (ctx == null) return

  setupCanvasSize()

  timer = createTimer({
    frameRate: 60,
    autoplay: false,
    loop: true,
    onUpdate: ({ deltaTime }) => {
      const delta = Math.max(deltaTime, 0)
      void delta

      ctx.clearRect(0, 0, canvas.width, canvas.height)
      renderContent(ctx)
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
