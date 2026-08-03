export function useFormatDate() {
  const { locale } = useI18n()

  function formatDate(dateStr: string | undefined, format: 'short' | 'long' = 'short') {
    if (!dateStr) return ''
    const date = new Date(dateStr)
    const localeMap: Record<string, string> = {
      pt: 'pt-BR',
      en: 'en-US',
      es: 'es-ES',
    }
    const options: Intl.DateTimeFormatOptions = format === 'long'
      ? { year: 'numeric', month: 'long', day: 'numeric' }
      : { year: 'numeric', month: 'short', day: 'numeric' }

    return date.toLocaleDateString(localeMap[locale.value] || 'pt-BR', options)
  }

  return { formatDate }
}

//teste

