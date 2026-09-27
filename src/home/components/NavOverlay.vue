<script setup lang="ts">
import type { AnimationCanceller } from '@home/utils'
import { useWindowSize } from '@vueuse/core'
import { animate, spring } from 'animejs'
import { locale, m } from 'virtual:i18n'
import { ref, useTemplateRef, watch } from 'vue'

type ActionPrompt = 'none' | 'to-notes' | 'locale-switch'
const actionPrompt = ref<ActionPrompt>('none')

const $notesEntry = useTemplateRef('$notesEntry')
const $localeSwitch = useTemplateRef('$localeSwitch')

let currentAnimation: AnimationCanceller | null = null

const gotoNotes = async () => {
  if (actionPrompt.value !== 'to-notes') {
    actionPrompt.value = 'to-notes'
  } else {
    currentAnimation?.cancel()
    await expandBeforeGotoNotes()

    switch (locale.value) {
      case 'zh-Hans':
        window.location.href = '/notes/zh'
        break
      default:
        window.location.href = '/notes/en'
    }
  }
}

const openLocaleSwitch = () => {
  locale.value = locale.value === 'en' ? 'zh-Hans' : 'en'
}

const cancel = () => {
  actionPrompt.value = 'none'
}

let skipAnimation = false

watch(actionPrompt, (val, old) => {
  if (skipAnimation) {
    skipAnimation = false
    return
  }

  if (val === 'to-notes' && old !== 'to-notes') {
    currentAnimation = expandEntry()
  }
  if (val !== 'to-notes' && old === 'to-notes') {
    currentAnimation = resumeEntry()
  }
})

const expandEntry = (): AnimationCanceller => {
  const entryAnimation = animate($notesEntry.value!, {
    width: 160,
    height: 160,
    ease: spring({ bounce: 0.5, duration: 500 }),
  })

  const switchAnimation = animate($localeSwitch.value!, {
    top: 140,
    ease: spring({ bounce: 0.5, duration: 500 }),
  })

  return {
    cancel() {
      entryAnimation.cancel()
      switchAnimation.cancel()
    },
  }
}

const expandBeforeGotoNotes = async () => {
  const { width, height } = useWindowSize()
  const w = width.value
  const h = height.value
  const radius = Math.sqrt(w * w + h * h) + 16

  await animate($notesEntry.value!, {
    top: (h - radius) / 2,
    right: (w - radius) / 2,
    width: radius,
    height: radius,
    duration: 800,
    ease: 'out(3)',
  })
}

const resumeEntry = (): AnimationCanceller => {
  currentAnimation?.cancel()

  const entryAnimation = animate($notesEntry.value!, {
    width: 128,
    height: 128,
    ease: 'outBack(0.75)',
    duration: 400,
  })

  const switchAnimation = animate($localeSwitch.value!, {
    top: 110,
    ease: 'outBack(0.75)',
    duration: 400,
  })

  return {
    cancel() {
      entryAnimation.cancel()
      switchAnimation.cancel()
    },
  }
}

const reset = () => {
  if ($notesEntry.value) {
    const el = $notesEntry.value
    el.style.width = ''
    el.style.height = ''
    el.style.top = ''
    el.style.right = ''
  }

  if ($localeSwitch.value) {
    const el = $localeSwitch.value
    el.style.top = ''
  }

  skipAnimation = true
  actionPrompt.value = 'none'
}

window.addEventListener('pageshow', (e) => {
  if (e.persisted) {
    reset()
  }
})
</script>

<template>
  <div class="nav-overlay">
    <div v-if="actionPrompt !== 'none'" class="cancel-layer" @click="cancel">
    </div>

    <div class="notes-entry" @click="gotoNotes" ref="$notesEntry">
      <div class="anchor">
        <svg class="outer-ring" viewBox="0 0 100 100">
          <!-- Three arcs, each starting at (50, 0) and sweeping 115 degrees clockwise. -->
          <path
            d="M 50 0 A 50 50 0 0 1 95.3154 71.1309"
            transform="rotate(0 50 50)"
            vector-effect="non-scaling-stroke"
          />
          <path
            d="M 50 0 A 50 50 0 0 1 95.3154 71.1309"
            transform="rotate(120 50 50)"
            vector-effect="non-scaling-stroke"
          />
          <path
            d="M 50 0 A 50 50 0 0 1 95.3154 71.1309"
            transform="rotate(240 50 50)"
            vector-effect="non-scaling-stroke"
          />
        </svg>

        <div class="prompt-pad">
          <div class="base">
            <div class="prompt-text">
              <span class="to">{{ m.notesTo() }}</span>
              <span class="notes">NOTES</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="locale-switch" @click="openLocaleSwitch" ref="$localeSwitch">
      <div>S</div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.nav-overlay {
  position: fixed;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;

  z-index: 16;
  pointer-events: none;
}

.cancel-layer {
  position: fixed;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;

  pointer-events: all;
}

.notes-entry {
  position: fixed;
  width: 128px;
  height: 128px;
  top: -28px;
  right: -28px;
  background-color: transparent;
  z-index: 2;

  cursor: pointer;
  pointer-events: all;
  user-select: none;

  display: flex;
  justify-content: center;
  align-items: center;

  .anchor {
    position: relative;
    width: 100%;
    height: 100%;
  }
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.outer-ring {
  position: absolute;
  width: 100%;
  height: 100%;
  overflow: visible;

  stroke: var(--color-sub);
  stroke-width: 2px;
  stroke-linecap: round;
  fill: none;

  animation: spin 12s linear infinite;
}

.prompt-pad {
  position: absolute;
  width: 100%;
  height: 100%;
  padding: 4px;

  display: flex;
  justify-content: center;
  align-items: center;

  .base {
    width: 100%;
    height: 100%;

    display: flex;
    justify-content: center;
    align-items: center;

    border-radius: 50%;
    background-color: var(--color-sub);
  }
}

.prompt-text {
  position: relative;
  transform: translateX(-6px) translateY(10px);
  color: var(--color-main);

  > .to {
    position: absolute;
    left: 0;
    right: 0;
    bottom: calc(1rem + 4px);
    text-align: center;
    font-size: 0.8rem;
    letter-spacing: 2px;
  }

  > .notes {
    letter-spacing: 1px;
  }
}

.locale-switch {
  pointer-events: all;

  position: fixed;
  top: 110px;
  right: 8px;
  width: 40px;
  height: 40px;
  color: var(--color-main);
  background-color: var(--color-sub);
  border-radius: 50%;

  display: flex;
  justify-content: center;
  align-items: center;

  cursor: pointer;
  user-select: none;
}
</style>
