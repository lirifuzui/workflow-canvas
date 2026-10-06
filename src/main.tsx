import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import { LocaleProvider } from './i18n/LocaleProvider'
import { detectLocale, persistLocale } from './i18n/locale'
import './index.css'

persistLocale(detectLocale())

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <LocaleProvider>
      <App />
    </LocaleProvider>
  </StrictMode>,
)
