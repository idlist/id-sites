<script setup lang="ts">
import IconAtom from '@assets/icons/atom.svg?component'
import IconBulb from '@assets/icons/bulb.svg?component'
import IconHome from '@assets/icons/home.svg?component'
import IconStars from '@assets/icons/stars.svg?component'
import { useEventListener, useWindowScroll, useWindowSize, watchThrottled } from '@vueuse/core'
import { animate } from 'animejs'
import { type GeneralVirtualMessage, m } from 'virtual:i18n'
import { type Component, type ComponentPublicInstance, onMounted, ref } from 'vue'
import BackgroundDots from './components/BackgroundDots.vue'
import GotoOverlay from './components/GotoOverlay.vue'
import NavOverlay from './components/NavOverlay.vue'
import ShowdownMask from './components/ShowdownMask.vue'
import FooterScreen from './screens/FooterScreen.vue'
import HomeBleed from './screens/HomeBleed.vue'
import HomeScreen from './screens/HomeScreen.vue'
import SkillsGacha from './screens/SkillsGacha.vue'
import SkillsHeader from './screens/SkillsHeader.vue'
import WorksDiamond from './screens/WorksDiamond.vue'
import WorksFlakepiles from './screens/WorksFlakepiles.vue'
import WorksHeader from './screens/WorksHeader.vue'

import type { ViteSvgComponent } from './utils.ts'

interface NavigationSection {
  section: Component
  id: string
  draft?: boolean
  query?: string
}

interface NavigationGroup {
  gid: string
  draft?: boolean
  icon: ViteSvgComponent
  label: GeneralVirtualMessage
  sections: NavigationSection[]
}

/** The structure of the page. */
const pageList: NavigationGroup[] = [
  {
    gid: 'home',
    icon: IconHome,
    label: m.groupHome,
    sections: [
      { section: HomeScreen, id: 'home' },
      { section: HomeBleed, id: 'home-bleed' },
    ],
  },
  {
    gid: 'skills',
    draft: true,
    icon: IconAtom,
    label: m.groupSkills,
    sections: [
      { section: SkillsHeader, id: 'skills' },
      { section: SkillsGacha, id: 'skill-gacha', query: 'gacha' },
    ],
  },
  {
    gid: 'works',
    draft: true,
    icon: IconBulb,
    label: m.groupWorks,
    sections: [
      { section: WorksHeader, id: 'works' },
      { section: WorksDiamond, id: 'diamond', query: 'diamond-palette' },
      { section: WorksFlakepiles, id: 'flakepiles', query: 'flakepiles' },
    ],
  },
  {
    gid: 'footer',
    draft: true,
    icon: IconStars,
    label: m.groupFooter,
    sections: [
      { section: FooterScreen, id: 'footer' },
    ],
  },
]

const navItems = pageList.filter((group) => {
  return !group.draft && group.sections.filter((section) => !section.draft).length > 0
}).map((group) => ({
  id: group.gid,
  icon: group.icon,
  label: group.label,
}))

const groupToElementSetMap = new Map<string, Map<string, ComponentPublicInstance>>()
const queryToElementMap = new Map<string, ComponentPublicInstance>()

function collectSection(
  el: ComponentPublicInstance,
  group: NavigationGroup,
  section: NavigationSection,
) {
  const groupInfo = groupToElementSetMap.getOrInsert(group.gid, new Map())

  if (el) {
    groupInfo.set(section.id, el)
    if (section.query) queryToElementMap.set(section.query, el)
  } else {
    groupInfo.delete(section.id)
    if (section.query) queryToElementMap.delete(section.query)
  }
}

interface GroupBorder {
  gid: string
  border: number
}

const navCursor = ref(pageList[0].gid)
const navGroupBorders = ref<GroupBorder[]>([])
const navQueryBorders = ref<Record<string, number>>({})
const navContentHeight = ref(0)
const { y: scrollY } = useWindowScroll()
const { width: windowWidth, height: windowHeight } = useWindowSize()

function setupNavigation() {
  navGroupBorders.value = []
  navQueryBorders.value = {}

  const root = document.scrollingElement ?? document.body
  const rootTop = root.getBoundingClientRect().y

  for (const [gid, sections] of groupToElementSetMap.entries()) {
    if (sections.size === 0) continue
    let border = Infinity

    for (const section of sections.values()) {
      const el = section.$el as HTMLElement
      const top = el.getBoundingClientRect().y - rootTop
      if (top < border) {
        border = top
      }
    }

    navGroupBorders.value.push({ border, gid })
  }

  navGroupBorders.value.sort((a, b) => a.border - b.border)

  for (const [query, section] of queryToElementMap.entries()) {
    const el = section.$el as HTMLElement
    const border = el.getBoundingClientRect().y - rootTop
    navQueryBorders.value[query] = border
  }

  navContentHeight.value = root.scrollHeight
}

function updateNavCursor() {
  if (!navGroupBorders.value.length) return

  const y = scrollY.value
  const h = windowHeight.value
  const list = navGroupBorders.value
  const max = navContentHeight.value
  let group: GroupBorder | undefined

  const last = list[list.length - 1]
  const bleed = 64

  if (max - last.border < h / 2 && y + h > max - bleed) {
    // Specially, if the last group cannot fill half of the page,
    // and the page has scrolled to the end,
    // The navigation cursor would still move to the last group.
    group = last
  } else {
    // Otherwise, move the cursor to the group
    // when it covers more than half of the page.
    group = list.findLast((s) => {
      return s.border - h / 2 <= y
    })
  }

  if (!group) return
  navCursor.value = group.gid
}

onMounted(() => {
  watchThrottled([windowWidth, windowHeight], () => {
    setupNavigation()
    updateNavCursor()
  }, { throttle: 100, immediate: true })

  watchThrottled(scrollY, () => {
    updateNavCursor()
  }, { throttle: 100 })
})

let currentScroll: ReturnType<typeof animate> | null = null

function scroll(y: number) {
  currentScroll?.cancel()
  currentScroll = animate(scrollY, {
    value: y,
    ease: 'out(3)',
    duration: 500,
  })
}

function scrollToGroup(gid: string) {
  const group = navGroupBorders.value.find((g) => g.gid === gid)
  if (!group) return

  scroll(group.border)
}

function jumpFromQuery() {
  const url = new URL(window.location.href)
  const query = url.searchParams.get('to')
  if (!query) return

  // Rewrite the URL to exclude the query.
  url.searchParams.delete('to')
  const next = `${url.pathname}${url.search}${url.hash}`
  window.history.replaceState(window.history.state, '', next)

  const border = navQueryBorders.value[query]
  if (typeof border === 'undefined') return
  scrollY.value = border
}

onMounted(() => {
  jumpFromQuery()
})

function cancelScroll() {
  currentScroll?.cancel()
}

const scrollingKeys = new Set([
  'ArrowUp',
  'ArrowDown',
  'PageUp',
  'PageDown',
  'Home',
  'End',
  ' ',
])

function cancelScrollOnKeys(e: KeyboardEvent) {
  if (e.altKey || e.ctrlKey || e.metaKey) return
  if (!scrollingKeys.has(e.key)) return
  if (e.shiftKey && e.key !== ' ') return

  currentScroll?.cancel()
}

// Cancel scroll on user input.
useEventListener('wheel', cancelScroll, { passive: true })
useEventListener('touchstart', cancelScroll, { passive: true })
useEventListener('keydown', cancelScrollOnKeys)
</script>

<template>
  <BackgroundDots />

  <template v-for="group of pageList" :key="group.gid">
    <template v-for="section of group.sections">
      <component
        v-if="!group.draft && !section.draft"
        :key="section.id"
        :is="section.section"
        :ref="(el: ComponentPublicInstance) => collectSection(el, group, section)"
      />
    </template>
  </template>

  <NavOverlay
    :nav-items="navItems"
    :cursor="navCursor"
    @request-scroll="scrollToGroup"
  />
  <GotoOverlay />
  <ShowdownMask />
</template>
