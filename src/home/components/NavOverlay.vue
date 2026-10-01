<script setup lang="ts">
import type { ViteSvgComponent } from '@home/utils.ts'
import { animate } from 'animejs'
import type { GeneralVirtualMessage } from 'virtual:i18n'
import { computed, reactive, watch } from 'vue'
import BubbleRect20 from './BubbleRect20.vue'

interface NavItem {
  id: string
  icon: ViteSvgComponent
  label: GeneralVirtualMessage
}

const props = withDefaults(
  defineProps<{
    navItems?: NavItem[]
    cursor?: string
  }>(),
  {
    navItems: () => [],
    cursor: 'home',
  },
)

const emit = defineEmits<{
  requestScroll: [string]
}>()

const mask = reactive({
  top: 2,
  bottom: 30,
})

const maskPx = computed(() => ({
  top: `${mask.top}px`,
  bottom: `${mask.bottom}px`,
}))

let currentAnimation: ReturnType<typeof animate> | null = null

watch(() => props.cursor, (val, old) => {
  if (val === old) return

  let index = props.navItems.findIndex((item) => item.id === val)
  if (index === -1) return

  const baseline = index * 32

  currentAnimation?.cancel()
  currentAnimation = animate(mask, {
    top: baseline + 2,
    bottom: baseline + 30,
    duration: 250,
    ease: 'out(3)',
  })
})
</script>

<template>
  <div class="nav-overlay">
    <BubbleRect20>
      <div class="nav-overlay-list">
        <div class="layer-below">
          <a
            v-for="item of navItems"
            :key="item.id"
            class="nav-overlay-item"
            @click="() => emit('requestScroll', item.id)"
          >
            <component :is="item.icon" />
          </a>
        </div>

        <div class="layer-above">
          <div
            v-for="item of navItems"
            :key="item.id"
            class="nav-overlay-item"
          >
            <component :is="item.icon" />
          </div>
        </div>
      </div>
    </BubbleRect20>
  </div>
</template>

<style scoped lang="scss">
.nav-overlay {
  position: fixed;
  top: 0;
  height: 100svh;
  right: 8px;
  pointer-events: none;
  user-select: none;

  display: flex;
  align-items: center;
  justify-content: center;
}

.nav-overlay-list {
  color: var(--color-main);
  background-color: var(--color-sub);
  position: relative;

  > .layer-below {
    pointer-events: all;
  }

  > .layer-above {
    position: absolute;
    inset: 0;
    background-color: var(--color-main);
    color: var(--color-sub);
    z-index: 1;

    clip-path: rect(v-bind("maskPx.top") 30px v-bind("maskPx.bottom") 2px round 14px);
  }
}

.nav-overlay-item {
  width: 32px;
  padding: 6px;

  display: block;
  cursor: pointer;
}
</style>
