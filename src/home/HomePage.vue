<script setup lang="ts">
import { animate } from 'animejs'
import { Common } from 'matter-js'
import { type ComponentPublicInstance, onMounted, reactive, ref } from 'vue'
import BackgroundDots from './components/BackgroundDots.vue'
import GotoOverlay from './components/GotoOverlay.vue'
import NavOverlay from './components/NavOverlay.vue'
import ShowdownMask from './components/ShowdownMask.vue'
import { type NavigationGroup, type NavigationSection, PageList } from './data/page-list.ts'

import {
  useEventListener,
  useWindowScroll,
  useWindowSize,
  watchDebounced,
  watchThrottled,
} from '@vueuse/core'

const navItems = PageList.filter((group) => {
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

  if (el !== null) {
    groupInfo.set(section.id, el)
    if (section.query) queryToElementMap.set(section.query, el)
  } else {
    groupInfo.delete(section.id)
    if (section.query) queryToElementMap.delete(section.query)
  }
}

interface ScrollBorder {
  id: string
  border: number
}

let groupBorders: ScrollBorder[] = []
let sectionBorders: ScrollBorder[] = []
let queryBorders: Record<string, number> = {}
let rootHeight = 0

const { y: scrollY } = useWindowScroll()
const { width: windowWidth, height: windowHeight } = useWindowSize()
const groupCursor = ref(PageList[0].gid)
const sectionCursor = reactive({
  id: PageList[0].sections[0].id,
  progress: 0,
})

function setupBorders() {
  groupBorders = []
  sectionBorders = []
  queryBorders = {}

  const root = document.scrollingElement ?? document.body
  const rootTop = root.getBoundingClientRect().y

  for (const [gid, sections] of groupToElementSetMap.entries()) {
    if (sections.size === 0) continue
    let border = Infinity

    for (const [sid, section] of sections.entries()) {
      const el = section.$el as HTMLElement
      const top = el.getBoundingClientRect().y - rootTop
      border = Math.min(top, border)
      sectionBorders.push({ id: sid, border: top })
    }

    groupBorders.push({ id: gid, border })
  }

  groupBorders.sort((a, b) => a.border - b.border)

  for (const [query, section] of queryToElementMap.entries()) {
    const el = section.$el as HTMLElement
    const border = el.getBoundingClientRect().y - rootTop
    queryBorders[query] = border
  }

  rootHeight = root.scrollHeight
}

function updateGroupCursor() {
  if (groupBorders.length === 0) return

  const y = scrollY.value
  const h = windowHeight.value
  const max = rootHeight
  let group: ScrollBorder | undefined

  const last = groupBorders[groupBorders.length - 1]
  const bleed = 64

  if (max - last.border < h / 2 && y + h > max - bleed) {
    // Specially, if the last group cannot fill half of the page,
    // and the page has scrolled to the end,
    // The navigation cursor would still move to the last group.
    group = last
  } else {
    // Otherwise, move the cursor to the group
    // when it covers more than half of the page.
    group = groupBorders.findLast((g) => g.border - h / 2 <= y)
  }

  if (!group) return
  groupCursor.value = group.id
}

function getSectionHeight(i: number) {
  const section = sectionBorders[i]
  const nextBorder = i < sectionBorders.length - 1
    ? sectionBorders[i + 1].border
    : rootHeight
  const height = nextBorder - section.border
  return height
}

function updateSectionCursor() {
  if (sectionBorders.length === 0) return

  const i = sectionBorders.findLastIndex((s) => s.border <= scrollY.value)
  const section = sectionBorders[i]
  const height = getSectionHeight(i)
  const passed = scrollY.value - section.border

  sectionCursor.id = section.id
  sectionCursor.progress = passed / height
}

function realignSectionProgress() {
  if (sectionBorders.length === 0) return

  const i = sectionBorders.findIndex((s) => s.id === sectionCursor.id)
  const section = sectionBorders[i]
  const height = getSectionHeight(i)
  const passed = height * sectionCursor.progress

  scrollY.value = section.border + passed
}

onMounted(() => {
  watchThrottled(scrollY, () => {
    updateGroupCursor()
    updateSectionCursor()
  }, { throttle: 100, trailing: true })

  watchDebounced([windowWidth, windowHeight], () => {
    setupBorders()
    realignSectionProgress()
    updateGroupCursor()
  }, { debounce: 100, immediate: true })
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
  const group = groupBorders.find((g) => g.id === gid)
  if (!group) return

  const offset = PageList.find((g) => g.gid === gid)?.offset ?? 0
  scroll(group.border + offset)
}

function jumpFromQuery() {
  const url = new URL(window.location.href)
  const query = url.searchParams.get('to')
  if (!query) return

  // Rewrite the URL to exclude the query.
  url.searchParams.delete('to')
  const next = `${url.pathname}${url.search}${url.hash}`
  window.history.replaceState(window.history.state, '', next)

  const border = queryBorders[query]
  if (border == null) return
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

// Disable the warning messages of matter.js in production.
if (import.meta.env.PROD) {
  Common.logLevel = 4
}
</script>

<template>
  <BackgroundDots />

  <template v-for="group of PageList" :key="group.gid">
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
    :cursor="groupCursor"
    @request-scroll="scrollToGroup"
  />
  <GotoOverlay />
  <ShowdownMask />
</template>
