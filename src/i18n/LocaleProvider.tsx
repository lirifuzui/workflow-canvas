import { useCallback, useMemo, useState, type ReactNode } from 'react'
import { detectLocale, persistLocale, type Locale } from './locale'
import { t } from './messages'
import { LocaleContext } from './useLocale'

export function LocaleProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(() => detectLocale())

  const setLocale = useCallback((next: Locale) => {
    setLocaleState(next)
    persistLocale(next)
  }, [])

  const value = useMemo(
    () => ({
      locale,
      setLocale,
      m: t(locale),
    }),
    [locale, setLocale],
  )

  return <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>
}
