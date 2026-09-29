<script setup lang="ts">
import IconHome from '@assets/icons/home.svg?component'
import { type CommonMessageShape, m } from 'virtual:i18n'
import { type Component, type ComponentPublicInstance } from 'vue'
import BackgroundDots from './components/BackgroundDots.vue'
import GotoOverlay from './components/GotoOverlay.vue'
import NavOverlay from './components/NavOverlay.vue'
import HomeScreen from './screens/HomeScreen.vue'
import type { ImportedSvgComponent } from './utils.ts'

interface NavigationSection {
  section: Component
  id: string
  query?: string
}

interface NavigationGroup {
  id: string
  icon: ImportedSvgComponent
  label: CommonMessageShape
  sections: NavigationSection[]
}

const pageList: NavigationGroup[] = [
  {
    id: 'home',
    icon: IconHome,
    label: m.homePage,
    sections: [
      { section: HomeScreen, id: 'home' },
    ],
  },
]

const navItems = pageList.map((group) => ({
  id: group.id,
  icon: group.icon,
  label: group.label,
}))

const collectSection = (el: ComponentPublicInstance, id: string) => {
}
</script>

<template>
  <BackgroundDots />

  <template v-for="group of pageList" :key="group.id">
    <component
      v-for="session of group.sections"
      :key="session.id"
      :is="session.section"
      :ref="(el: ComponentPublicInstance) => collectSection(el, session.id)"
    />
  </template>

  <NavOverlay :nav-items="navItems" />
  <GotoOverlay />
</template>
