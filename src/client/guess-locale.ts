function guessFromNavigatorPreferences(): string | null {
  const locales = navigator.languages
  if (!locales) return null
  if (!locales.length) return null
  return locales[0]
}

function guessFromNavigator(): string | null {
  const locale = navigator.language
  if (!locale) return null
  return locale
}

function guessFromIntl(): string | null {
  if (!Intl) return null
  const locale = Intl.DateTimeFormat().resolvedOptions().locale
  return locale
}

export function guessLocale(fallback: string = 'en'): string {
  let locale = guessFromNavigatorPreferences()
  if (!locale) locale = guessFromNavigator()
  if (!locale) locale = guessFromIntl()
  if (!locale) return fallback
  return locale
}

export function guessLocaleWithStorage(fallback: string = 'en'): string {
  let locale = localStorage.getItem('locale')
  if (locale) return locale

  locale = guessLocale()
  if (!locale) locale = fallback

  setLocaleInStorage(locale)
  return locale
}

export function setLocaleInStorage(locale: string) {
  localStorage.setItem('locale', locale)
}
