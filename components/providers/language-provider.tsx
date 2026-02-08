'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'
import { dictionaries, Language, Dictionary } from '@/lib/i18n/dictionaries'

interface LanguageContextType {
  language: Language
  setLanguage: (lang: Language) => void
  t: Dictionary
  dir: 'ltr' | 'rtl'
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined)

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguage] = useState<Language>('en')
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    const saved = localStorage.getItem('language') as Language
    if (saved && Object.keys(dictionaries).includes(saved)) {
      setLanguage(saved)
    }
    setMounted(true)
  }, [])

  useEffect(() => {
    if (mounted) {
      localStorage.setItem('language', language)
      const isRtl = language === 'ar' || language === 'ur'
      document.documentElement.dir = isRtl ? 'rtl' : 'ltr'
      document.documentElement.lang = language
    }
  }, [language, mounted])

  const isRtl = language === 'ar' || language === 'ur'

  const value = {
    language,
    setLanguage,
    t: dictionaries[language],
    dir: isRtl ? 'rtl' : 'ltr' as 'ltr' | 'rtl'
  }

  if (!mounted) {
    return null // or a loading spinner
  }

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useLanguage() {
  const context = useContext(LanguageContext)
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider')
  }
  return context
}
