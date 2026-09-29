<script setup lang="ts">
import IconIdlist from '@assets/idlist-light.svg?component'
import BubbleRect16 from '@home/components/BubbleRect16.vue'
import PageFull from '@home/components/PageFull.vue'
import { titles, type TitleType } from '@home/data/titles'
import { useIntervalFn } from '@vueuse/core'
import { shuffle, swapIndices } from 'remeda'
import { m } from 'virtual:i18n'
import { computed, ref } from 'vue'

const chances: Record<TitleType, number> = {
  major: 1,
  minor: 0.25,
  special: 0.01,
}

const generateTitleQueue = (lastId?: string): string[] => {
  const candidates = titles
    .filter((t) => Math.random() < chances[t.type])
    .map((t) => t.id)

  const queue = shuffle(candidates)
  if (lastId && queue[0] === lastId) swapIndices(queue, 0, 1)
  return queue
}

let titleQueue = generateTitleQueue()

const titleQueueIdx = ref(0)
const titleId = computed(() => titleQueue[titleQueueIdx.value])

useIntervalFn(() => {
  if (titleQueueIdx.value === titleQueue.length - 1) {
    titleQueue = generateTitleQueue(titleId.value)
    titleQueueIdx.value = 0
  } else {
    titleQueueIdx.value++
  }
}, 5000)
</script>

<template>
  <PageFull class="home-screen">
    <div class="main">
      <div class="first-row">
        <div class="home-icon">
          <IconIdlist />
        </div>

        <div class="home-title-badge">
          <BubbleRect16>
            <div class="home-title-content">
              <span>{{ m.canDo() }}</span>
              <div class="relative">
                <Transition v-for="{ id, color } of titles" name="home-title">
                  <span
                    v-if="id === titleId"
                    :key="id"
                    class="home-title"
                    :style="{ color: color ?? 'var(--color-main)' }"
                  >
                    {{ m[id]() }}
                  </span>
                </Transition>
              </div>
            </div>
          </BubbleRect16>
        </div>
      </div>

      <div class="home-divider">
        <svg class="line">
          <line
            x1="0"
            y1="50%"
            x2="100%"
            y2="50%"
            stroke="currentColor"
            stroke-width="2"
            stroke-dasharray="12 16"
            stroke-linecap="round"
          />
        </svg>
      </div>

      <div class="home-contacts"></div>
    </div>
  </PageFull>
</template>

<style scoped lang="scss">
.home-screen {
  position: relative;
  user-select: none;

  > .main {
    position: absolute;
    bottom: 1rem;
    left: 1rem;
    right: 1rem;
  }
}

.first-row {
  display: grid;
  grid-template-columns: max-content max-content;
  column-gap: 1rem;
  row-gap: 0.75rem;
  align-items: end;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    justify-items: start;
  }
}

.home-icon {
  height: 4rem;

  > svg {
    width: auto;
  }
}

.home-title-badge {
  font-family: var(--font-unique);
}

.home-title-content {
  width: 16rem;

  color: var(--color-main);
  background-color: var(--color-sub);
  padding: 0 0.5rem;

  display: grid;
  grid-template-columns: max-content auto;
  column-gap: 0.25rem;

  > .relative {
    position: relative;
  }
}

.home-title {
  position: absolute;
  font-weight: bold;

  &-enter-active,
  &-leave-active {
    transition: all 0.5s ease;
  }

  &-enter-from {
    opacity: 0;
    transform: translateY(-1rem);
  }

  &-leave-to {
    opacity: 0;
    transform: translateY(1rem);
  }
}

.home-divider {
  width: 100%;
  max-width: 768px;
  margin: 0.75rem 0;

  > .line {
    width: 100%;
    height: 4px;
    overflow: visible;
  }
}

.home-contacts {}
</style>
