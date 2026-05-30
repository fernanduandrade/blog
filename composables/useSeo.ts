import { useSeoMeta } from "nuxt/app"

export function useSeo(options: {
  title?: string
  description?: string
  image?: string
  type?: string
}) {
  const baseTitle = 'Fernando Andrade'
  const fullTitle = options.title ? `${options.title} — ${baseTitle}` : baseTitle

  useSeoMeta({
    title: fullTitle,
    description: options.description,
    ogTitle: options.title || baseTitle,
    ogDescription: options.description,
    ogType: (options.type as any) || 'website',
    ogImage: options.image || '/og-image.png',
    twitterCard: 'summary_large_image',
    twitterTitle: options.title || baseTitle,
    twitterDescription: options.description,
  })
}
