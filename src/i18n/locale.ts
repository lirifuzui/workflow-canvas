export type Locale = 'en' | 'zh' | 'ja'

const STORAGE_KEY = 'workflow-canvas-locale'

export function detectLocale(): Locale {
  // URL override for demos / agent deep-links: ?lang=zh|ja|en
  try {
    const fromUrl = new URLSearchParams(window.location.search).get('lang')
    if (fromUrl === 'en' || fromUrl === 'zh' || fromUrl === 'ja') return fromUrl
  } catch {
    /* ignore */
  }

  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved === 'en' || saved === 'zh' || saved === 'ja') return saved
  } catch {
    /* ignore */
  }

  const langs = typeof navigator !== 'undefined' ? navigator.languages ?? [navigator.language] : ['en']
  for (const raw of langs) {
    const code = raw.toLowerCase()
    if (code.startsWith('zh')) return 'zh'
    if (code.startsWith('ja')) return 'ja'
  }
  return 'en'
}

export function persistLocale(locale: Locale) {
  try {
    localStorage.setItem(STORAGE_KEY, locale)
  } catch {
    /* ignore */
  }
  if (typeof document !== 'undefined') {
    document.documentElement.lang = locale === 'zh' ? 'zh-CN' : locale === 'ja' ? 'ja' : 'en'
  }
}
