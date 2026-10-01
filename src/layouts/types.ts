import type { SupportedLocales } from 'virtual:i18n'

export interface BaseProps {
  locale?: SupportedLocales
  title: string
}

export interface NotesProps extends BaseProps {
}
