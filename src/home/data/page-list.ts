import IconAtom from '@assets/icons/atom.svg?component'
import IconBulb from '@assets/icons/bulb.svg?component'
import IconHome from '@assets/icons/home.svg?component'
import IconStars from '@assets/icons/stars.svg?component'
import { type GeneralVirtualMessage, m } from 'virtual:i18n'
import type { Component } from 'vue'
import { FooterBleed } from '../designs/footer'
import FooterScreen from '../screens/FooterScreen.vue'
import HomeBleed from '../screens/HomeBleed.vue'
import HomeScreen from '../screens/HomeScreen.vue'
import HomeWhoami from '../screens/HomeWhoami.vue'
import SkillsGacha from '../screens/SkillsGacha.vue'
import SkillsHeader from '../screens/SkillsHeader.vue'
import WorksDiamond from '../screens/WorksDiamond.vue'
import WorksFlakepiles from '../screens/WorksFlakepiles.vue'
import WorksHeader from '../screens/WorksHeader.vue'
import WorksOthers from '../screens/WorksOthers.vue'
import type { ViteSvgComponent } from '../utils'

export interface NavigationSection {
  section: Component
  id: string
  draft?: boolean
  query?: string
}

export interface NavigationGroup {
  gid: string
  draft?: boolean
  icon: ViteSvgComponent
  label: GeneralVirtualMessage
  offset?: number
  sections: NavigationSection[]
}

/** The structure of the page. */
export const pageList: NavigationGroup[] = [
  {
    gid: 'home',
    icon: IconHome,
    label: m.groupHome,
    sections: [
      { section: HomeScreen, id: 'home' },
      { section: HomeBleed, id: 'home-bleed' },
      { section: HomeWhoami, id: 'whoami', draft: true },
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
    icon: IconBulb,
    label: m.groupWorks,
    sections: [
      { section: WorksHeader, id: 'works' },
      { section: WorksDiamond, id: 'diamond', query: 'diamond-palette', draft: true },
      { section: WorksFlakepiles, id: 'flakepiles', query: 'flakepiles' },
      { section: WorksOthers, id: 'works-others' },
    ],
  },
  {
    gid: 'footer',
    icon: IconStars,
    label: m.groupFooter,
    offset: FooterBleed,
    sections: [
      { section: FooterScreen, id: 'footer' },
    ],
  },
]
