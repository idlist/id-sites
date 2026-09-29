<script setup lang="ts">
import IconIdlist from '@assets/idlist-light.svg?component'
import BubbleRect16 from '@home/components/BubbleRect16.vue'
import BubbleRect20 from '@home/components/BubbleRect20.vue'
import PageFull from '@home/components/PageFull.vue'
import { contacts } from '@home/data/contacts'
import { titles, type TitleType } from '@home/data/titles'
import { useIntervalFn } from '@vueuse/core'
import { shuffle, swapIndices } from 'remeda'
import { m, toMessage } from 'virtual:i18n'
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

      <div class="home-contacts">
        <BubbleRect20 v-for="contact of contacts">
          <a
            class="home-contacts-item"
            :href="contact.link"
            target="_blank"
            noopener
            noreferer
          >
            <div class="platform">
              <div class="icon">
                <component :is="contact.icon" />
              </div>
              <p class="text">{{ toMessage(contact.platform) }}</p>
            </div>
            <p class="id">{{ contact.id }}</p>
          </a>
        </BubbleRect20>
      </div>
    </div>
  </PageFull>
</template>

<style scoped lang="scss">
.home-screen {
  position: relative;
  user-select: none;

  > .main {
    position: absolute;
    bottom: 2rem;
    left: 2rem;
    right: 2rem;
  }

  @media (max-width: 768px) {
    & > .main {
      bottom: 1rem;
      left: 1rem;
      right: 1rem;
    }
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

.home-contacts {
  display: flex;
  column-gap: 0.75rem;
  row-gap: 0.5rem;
  flex-wrap: wrap;
}

.home-contacts-item {
  background-color: var(--color-main);

  display: flex;
  align-items: stretch;
  height: 100%;
  text-decoration: none;

  > .platform {
    display: flex;
    align-items: center;
    padding: 0 0.125rem;
    color: var(--color-sub);
  }

  > .platform > .icon {
    width: 2rem;
    height: 2rem;
    padding: 0.125rem;
  }

  > .platform > .text {
    padding: 0 0.125rem 0 0.25rem;
  }

  @media (max-width: 480px) {
    > .platform > .text {
      display: none;
    }
  }

  > .id {
    display: flex;
    align-items: center;
    height: 100%;

    color: var(--color-main);
    background-color: var(--color-sub);

    border-radius: 8px 16px 16px 8px;
    padding: 0 0.5rem 0 0.25rem;
    height: 100%;

    transition: background-color 0.25s ease;
  }

  &:hover > .id {
    background-color: var(--color-sub-2);
  }
}
</style>
