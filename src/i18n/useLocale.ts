import { createContext, useContext } from 'react'
import type { Locale } from './locale'
import { t, type Messages } from './messages'

export type LocaleContextValue = {
  locale: Locale
  setLocale: (locale: Locale) => void
  m: Messages
}

export const LocaleContext = createContext<LocaleContextValue | null>(null)

export function useLocale() {
  const ctx = useContext(LocaleContext)
  if (!ctx) {
    return {
      locale: 'en' as Locale,
      setLocale: () => undefined,
      m: t('en'),
    }
  }
  return ctx
}
