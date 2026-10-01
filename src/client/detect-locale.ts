function detectFromNavigatorPreferences(): string | null {
  const locales = navigator.languages
  if (!locales) return null
  if (!locales.length) return null
  return locales[0]
}

function detectFromNavigator(): string | null {
  const locale = navigator.language
  if (!locale) return null
  return locale
}

function detectFromIntl(): string | null {
  if (!Intl) return null
  const locale = Intl.DateTimeFormat().resolvedOptions().locale
  return locale
}

export function detectLocale(fallback: string = 'en'): string {
  let locale = detectFromNavigatorPreferences()
  if (!locale) locale = detectFromNavigator()
  if (!locale) locale = detectFromIntl()
  if (!locale) return fallback
  return locale
}

export function detectLocaleWithStorage(fallback: string = 'en'): string {
  let locale = localStorage.getItem('locale')
  if (locale) return locale

  locale = detectLocale()
  if (!locale) locale = fallback

  setLocaleInStorage(locale)
  return locale
}

export function setLocaleInStorage(locale: string) {
  localStorage.setItem('locale', locale)
}
