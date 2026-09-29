<script setup lang="ts">
import type { ImportedSvgComponent } from '@home/utils.ts'
import type { CommonMessageShape } from 'virtual:i18n'
import { computed, reactive } from 'vue'
import BubbleRect20 from './BubbleRect20.vue'

interface NavItem {
  id: string
  icon: ImportedSvgComponent
  label: CommonMessageShape
}

defineProps<{
  navItems?: NavItem[]
}>()

const model = defineModel<string>({ default: 'home' })

const mask = reactive({
  top: 2,
  bottom: 30,
})

const maskPx = computed(() => ({
  top: `${mask.top}px`,
  bottom: `${mask.bottom}px`,
}))
</script>

<template>
  <div class="nav-overlay">
    <BubbleRect20>
      <div class="nav-overlay-list">
        <div class="layer-below">
          <a
            v-for="item of navItems ?? []"
            :key="item.id"
            class="nav-overlay-item"
            @click="model = item.id"
          >
            <component :is="item.icon" />
          </a>
        </div>

        <div class="layer-above">
          <div
            v-for="item of navItems ?? []"
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
  top: 50%;
  bottom: 50%;
  right: 8px;
  pointer-events: none;
  user-select: none;
}

.nav-overlay-list {
  color: var(--color-main);
  background-color: var(--color-sub);
  position: relative;

  > .layer-below, > .layer-above {
    padding: 2px;
  }

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
  width: 28px;
  padding: 4px;

  display: block;
  cursor: pointer;
}
</style>
