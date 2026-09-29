import { m } from 'virtual:i18n'

export type TitleType = 'major' | 'minor' | 'special'

interface TitleOption {
  id: keyof typeof m
  type: TitleType
  color?: string
}

export const titles: TitleOption[] = [
  {
    id: 'webDevelopment',
    type: 'major',
    color: '#3d6199',
  },
  {
    id: 'webDesign',
    type: 'major',
    color: '#6b57a8',
  },
  {
    id: 'programming',
    type: 'major',
    color: '#3f7a4d',
  },
  {
    id: 'gameDevelopment',
    type: 'major',
    color: '#37808f',
  },
  {
    id: 'graphicDesign',
    type: 'minor',
    color: '#9b55a5',
  },
  {
    id: 'digitalArt',
    type: 'minor',
    color: '#ad4a48',
  },
  {
    id: 'desktopMusic',
    type: 'minor',
    color: '#9a6832',
  },
  {
    id: 'idealism',
    type: 'special',
    color: '#555555',
  },
  {
    id: 'furry',
    type: 'special',
    color: '#b0653a',
  },
]
