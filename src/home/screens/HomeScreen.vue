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
              <p>{{ m.canDo() }}</p>
              <div class="relative">
                <Transition v-for="{ id, color } of titles" name="home-title">
                  <p
                    v-if="id === titleId"
                    :key="id"
                    class="home-title"
                    :style="{ color: color ?? 'var(--color-main)' }"
                  >
                    {{ m[id]() }}
                  </p>
                </Transition>
              </div>
            </div>
          </BubbleRect16>
        </div>
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
    bottom: 0;
    left: 0;
    right: 0;
  }
}

.first-row {
  display: grid;
  grid-template-columns: min-content min-content;
  align-items: end;

  @media (max-width: 768px) {
    grid-template-columns: min-content;
  }
}

.home-icon {
  width: 12rem;
}

.home-title-badge {
  padding: 1rem 0;

  @media (max-width: 768px) {
    padding: 0 1rem 0.5rem 1rem;
  }
}

.home-title-content {
  width: 16rem;

  color: var(--color-main);
  background-color: var(--color-sub);
  padding: 0 0.375rem;

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

.home-contacts {
  padding: 0.5rem 1rem;
}
</style>
