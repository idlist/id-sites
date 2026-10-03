<script setup lang="ts">
import IconGlobe from '@assets/icons/globe.svg?component'
import type { AnimationCanceller } from '@home/utils'
import { useWindowSize } from '@vueuse/core'
import { animate, spring } from 'animejs'
import { m, type SupportedLocales } from 'virtual:i18n'
import { computed, ref, useTemplateRef, watch } from 'vue'
import Bubble40 from './Bubble40.vue'
import BubbleRect16 from './BubbleRect16.vue'

const props = withDefaults(
  defineProps<{
    where?: 'home' | 'notes'
  }>(),
  {
    where: 'home',
  },
)

const emit = defineEmits<{
  goto: []
  updateLocale: [SupportedLocales]
}>()

const destination = {
  home: 'NOTES',
  notes: 'HOME',
}

type ActionPrompt = 'none' | 'goto-notes' | 'locale-switch'
const actionPrompt = ref<ActionPrompt>('none')
const showBlocker = ref(false)
const { width: windowWidth, height: windowHeight } = useWindowSize()

const $notesEntry = useTemplateRef('$notesEntry')
const $notesEntryText = useTemplateRef('$notesEntryText')
const $localeSwitch = useTemplateRef('$localeSwitch')

let currentAnimation: AnimationCanceller | null = null

async function gotoNotes() {
  if (actionPrompt.value !== 'goto-notes') {
    actionPrompt.value = 'goto-notes'
  } else {
    currentAnimation?.cancel()
    await expandBeforeGotoNotes()
    emit('goto')
  }
}

function openLocaleDialog() {
  actionPrompt.value = 'locale-switch'
}

function setLocale(newLocale: SupportedLocales) {
  emit('updateLocale', newLocale)
  actionPrompt.value = 'none'
}

function cancel() {
  actionPrompt.value = 'none'
}

let skipAnimation = false

watch(actionPrompt, (val, old) => {
  if (skipAnimation) {
    skipAnimation = false
    return
  }

  if (val === 'goto-notes' && old !== 'goto-notes') {
    currentAnimation = expandEntry()
  }
  if (val !== 'goto-notes' && old === 'goto-notes') {
    currentAnimation = resumeEntry()
  }
})

function expandEntry(): AnimationCanceller {
  const entryAnimation = animate($notesEntry.value!, {
    width: 160,
    height: 160,
    ease: spring({ bounce: 0.5, duration: 500 }),
  })

  const switchAnimation = animate($localeSwitch.value!, {
    top: 144,
    ease: spring({ bounce: 0.5, duration: 500 }),
  })

  return {
    cancel() {
      entryAnimation.cancel()
      switchAnimation.cancel()
    },
  }
}

async function expandBeforeGotoNotes() {
  const w = windowWidth.value
  const h = windowHeight.value
  const radius = Math.sqrt(w * w + h * h) + 16

  showBlocker.value = true

  if ($notesEntryText.value) {
    $notesEntryText.value.classList.add('-centered')
  }

  await Promise.all([
    animate($notesEntry.value!, {
      top: (h - radius) / 2,
      right: (w - radius) / 2,
      width: radius,
      height: radius,
      duration: 800,
      ease: 'out(3)',
    }),
    animate($notesEntryText.value!, {
      opacity: 0,
      delay: 550,
      duration: 250,
    }),
  ])
}

function resumeEntry(): AnimationCanceller {
  currentAnimation?.cancel()

  const entryAnimation = animate($notesEntry.value!, {
    width: 120,
    height: 120,
    ease: 'outBack(0.75)',
    duration: 400,
  })

  const switchAnimation = animate($localeSwitch.value!, {
    top: 108,
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

function reset() {
  if ($notesEntry.value) {
    $notesEntry.value.style.width = ''
    $notesEntry.value.style.height = ''
    $notesEntry.value.style.top = ''
    $notesEntry.value.style.right = ''
  }

  if ($notesEntryText.value) {
    $notesEntryText.value.classList.remove('-centered')
    $notesEntryText.value.style.opacity = ''
  }

  if ($localeSwitch.value) {
    $localeSwitch.value.style.top = ''
  }

  showBlocker.value = false

  skipAnimation = true
  actionPrompt.value = 'none'
}

window.addEventListener('pageshow', (e) => {
  if (e.persisted) {
    reset()
  }
})

// These values do not need responsiveness.
const isDark = props.where === 'notes'
const useDark = isDark ? '-dark' : ''
</script>

<template>
  <div class="nav-overlay">
    <div v-if="actionPrompt !== 'none'" class="nav-overlay-canceller" @click="cancel"></div>

    <div class="note-entry" @click="gotoNotes" ref="$notesEntry">
      <div class="anchor">
        <svg class="note-entry-ring" :class="useDark" viewBox="0 0 100 100">
          <!-- Three arcs starting at (50, 0) and sweeping 115 degrees clockwise. -->
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

        <div class="note-entry-circle" :class="useDark">
          <div class="base">
            <div class="note-entry-text" :class="useDark" ref="$notesEntryText">
              <span class="to">{{ m.gotoNotes() }}</span>
              <span class="notes">{{ destination[props.where] }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="locale-switch" ref="$localeSwitch">
      <div class="anchor">
        <Transition name="locale-switch-btn">
          <Bubble40
            v-if="actionPrompt !== 'locale-switch'"
            :dark="isDark"
            @click="openLocaleDialog"
          >
            <div class="locale-switch-btn" :class="useDark">
              <a class="btn" aria-label="locale button">
                <IconGlobe />
              </a>
            </div>
          </Bubble40>
        </Transition>

        <Transition name="locale-switch-dialog">
          <div
            v-if="actionPrompt === 'locale-switch'"
            class="locale-switch-dialog"
          >
            <BubbleRect16 :dark="isDark">
              <div class="locale-option-list" :class="useDark">
                <a
                  class="locale-option"
                  :class="useDark"
                  @click="() => setLocale('zh')"
                >简体中文</a>
                <a
                  class="locale-option"
                  :class="useDark"
                  @click="() => setLocale('en')"
                >English</a>
              </div>
            </BubbleRect16>
          </div>
        </Transition>
      </div>
    </div>

    <div v-if="showBlocker" class="blocker"></div>
  </div>
</template>

<style scoped lang="scss">
.nav-overlay {
  position: fixed;
  inset: 0;

  z-index: 16;
  pointer-events: none;
  font-size: 16px;

  > .blocker {
    position: fixed;
    inset: 0;

    z-index: 16;
    pointer-events: all;
  }
}

.nav-overlay-canceller {
  position: fixed;
  inset: 0;

  pointer-events: all;
}

.note-entry {
  position: fixed;
  width: 120px;
  height: 120px;
  top: -24px;
  right: -24px;
  background-color: transparent;
  z-index: 2;

  cursor: pointer;
  pointer-events: all;
  user-select: none;

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

.note-entry-ring {
  position: absolute;
  width: 100%;
  height: 100%;
  overflow: visible;

  stroke: var(--color-sub);
  stroke-width: 2px;
  stroke-linecap: round;
  fill: none;

  animation: spin 12s linear infinite;

  &.-dark {
    stroke: var(--color-main);
  }
}

.note-entry-circle {
  position: absolute;
  width: 100%;
  height: 100%;
  padding: 4px;

  display: flex;
  justify-content: center;
  align-items: center;

  > .base {
    width: 100%;
    height: 100%;

    display: flex;
    justify-content: center;
    align-items: center;

    border-radius: 50%;
    background-color: var(--color-sub);
  }

  &.-dark > .base {
    background-color: var(--color-main);
  }
}

.note-entry-text {
  position: relative;
  transform: translateX(-5px) translateY(9px);
  color: var(--color-main);

  &.-dark {
    color: var(--color-sub);
  }

  > .to {
    position: absolute;
    left: 0;
    right: 0;
    bottom: 20px;

    font-size: 0.75em;
    text-align: center;
    letter-spacing: 2px;
  }

  > .notes {
    font-family: var(--font-unique);
    letter-spacing: 2px;
  }

  &.-centered {
    transform: translateX(0) translateY(0);
    transition: transform 0.8s ease-in;
  }
}

.locale-switch {
  pointer-events: all;

  position: fixed;
  top: 108px;
  right: 8px;

  cursor: pointer;
  user-select: none;

  > .anchor {
    position: relative;
  }
}

.locale-switch-btn {
  width: 100%;
  height: 100%;

  background-color: var(--color-sub);
  color: var(--color-main);

  transition: all 0.125s ease;

  &.-dark {
    background-color: var(--color-main);
    color: var(--color-sub);
  }

  .btn {
    width: 100%;
    height: 100%;
    border-radius: 50%;

    display: flex;
    justify-content: center;
    align-items: center;
    padding: 2px;

    transform: rotate(15deg);
  }

  &-enter-active {
    transition: all 0.25s ease-out;
  }

  &-leave-active {
    transition: all 0.25s ease-in;
  }

  &-enter-from,
  &-leave-to {
    opacity: 0;
    transform: translateX(16px);
  }
}

.locale-switch {
  &:hover .locale-switch-btn {
    background-color: var(--color-sub-2);
  }

  &:hover .locale-switch-btn.-dark {
    background-color: var(--color-main-2);
  }
}

.locale-switch-dialog {
  position: absolute;
  top: 0px;
  right: 0px;

  &-enter-active {
    transition: all 0.25s ease-out;
  }

  &-leave-active {
    transition: all 0.25s ease-in;
  }

  &-enter-from,
  &-leave-to {
    opacity: 0;
    transform: translateX(-16px);
  }
}

.locale-option-list {
  background-color: var(--color-sub);
  color: var(--color-main);

  &.-dark {
    background-color: var(--color-main);
    color: var(--color-sub);
  }
}

.locale-option {
  display: block;
  word-break: keep-all;
  padding: 6px 12px 6px 16px;
  text-align: right;
  transition: background-color 0.25s ease;

  &:hover {
    background-color: var(--color-sub-2);
  }

  &.-dark:hover {
    background-color: var(--color-main-2);
  }

  &:first-child {
    padding-top: 8px;
  }

  &:last-child {
    padding-bottom: 8px;
  }
}
</style>
