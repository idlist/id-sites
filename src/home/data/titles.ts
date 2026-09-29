import type { m } from 'virtual:i18n'

export type TitleType = 'major' | 'minor' | 'special'

export interface TitleItem {
  id: keyof typeof m
  type: TitleType
  color: string
}

export const titles: TitleItem[] = [
  {
    id: 'webDevelopment',
    type: 'major',
    color: '#6bb5ff',
  },
  {
    id: 'webDesign',
    type: 'major',
    color: '#b690fd',
  },
  {
    id: 'programming',
    type: 'major',
    color: '#06ca58',
  },
  {
    id: 'gameDevelopment',
    type: 'major',
    color: '#ff6363',
  },
  {
    id: 'graphicDesign',
    type: 'minor',
    color: '#fc77e6',
  },
  {
    id: 'digitalArt',
    type: 'minor',
    color: '#06cfd6',
  },
  {
    id: 'desktopMusic',
    type: 'minor',
    color: '#e7be08',
  },
  {
    id: 'idealism',
    type: 'special',
    color: '#aaaaaa',
  },
  {
    id: 'furry',
    type: 'special',
    color: '#f07d0b',
  },
]
