<script setup lang="ts">
import { m } from 'virtual:i18n'
import { type Component, type ComponentPublicInstance, useTemplateRef } from 'vue'
import BackgroundDots from './components/BackgroundDots.vue'
import GotoOverlay from './components/GotoOverlay.vue'
import HomeScreen from './screens/HomeScreen.vue'

interface NavigationSection {
  section: Component
  id: string
  query?: string
}

interface NavigationGroup {
  groupId: string
  label: (...args: unknown[]) => unknown
  icon?: string
  sections: NavigationSection[]
}

const pageList: NavigationGroup[] = [
  {
    groupId: 'home',
    label: m.homePage,
    sections: [
      { section: HomeScreen, id: 'home' },
    ],
  },
]

const collectSection = (el: ComponentPublicInstance, id: string) => {
}
</script>

<template>
  <BackgroundDots />

  <template v-for="g of pageList" :key="g.groupId">
    <component
      v-for="s of g.sections"
      :key="s.id"
      :is="s.section"
      :ref="(el: ComponentPublicInstance) => collectSection(el, s.id)"
    />
  </template>

  <GotoOverlay />
</template>
