<script setup lang="ts">
import BubbleRect16 from '@home/components/BubbleRect16.vue'
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

// Change titleId to a fixed value to debug.
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
              :style="{
                color: color,
                textShadow: `${color} 0 0 0.25rem`,
              }"
            >
              {{ m[id]() }}
            </span>
          </Transition>
        </div>
      </div>
    </BubbleRect16>
  </div>
</template>

<style scoped lang="scss">
.home-title-badge {
  font-family: var(--font-unique);
}

.home-title-content {
  width: 16rem;
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
</style>
