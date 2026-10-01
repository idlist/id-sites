import IconBluesky from '@assets/icons/bluesky.svg?component'
import IconDiscord from '@assets/icons/discord.svg?component'
import IconEmail from '@assets/icons/email.svg?component'
import IconGitHub from '@assets/icons/github.svg?component'
import IconSoundCloud from '@assets/icons/soundcloud.svg?component'
import IconX from '@assets/icons/x.svg?component'
import type { ViteSvgComponent } from '@home/utils'
import { type GeneralVirtualMessage, m } from 'virtual:i18n'

export interface ContactItem {
  type: string
  platform: string | GeneralVirtualMessage
  id: string
  link: string
  icon: ViteSvgComponent
}

export const contacts: ContactItem[] = [
  {
    type: 'email',
    platform: m.email,
    id: 'i@idl.ist',
    link: 'mailto:i@idl.ist',
    icon: IconEmail,
  },
  {
    type: 'x',
    platform: 'X',
    id: '@i_dlist',
    link: 'https://x.com/i_dlist',
    icon: IconX,
  },
  {
    type: 'bluesky',
    platform: 'Bluesky',
    id: '@idl.ist',
    link: 'https://bsky.app/profile/idl.ist',
    icon: IconBluesky,
  },
  {
    type: 'discord',
    platform: 'Discord',
    id: '@i_dlist',
    link: 'https://discord.com/',
    icon: IconDiscord,
  },
  {
    type: 'github',
    platform: 'GitHub',
    id: '@idlist',
    link: 'https://github.com/idlist',
    icon: IconGitHub,
  },
  {
    type: 'soundcloud',
    platform: 'SoundCloud',
    id: '@idlist',
    link: 'https://soundcloud.com/idlist',
    icon: IconSoundCloud,
  },
]
