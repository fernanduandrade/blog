<template>
  <div v-if="post" class="container">
    <!-- Meta -->
    <div class="article-meta">
      <div class="article-breadcrumb">
        <NuxtLinkLocale to="/blog">{{ $t('article.backToBlog') }}</NuxtLinkLocale>
        <span>›</span>
        <span v-if="post.category" class="article-category">{{ categoryLabel }}</span>
        <span v-if="post.category">›</span>
        <span>{{ post.title }}</span>
      </div>
      <div class="article-info">
        <span>{{ formatDate(post.date) }}</span>
        <span v-if="readingTime">·</span>
        <span v-if="readingTime">{{ readingTime }} {{ $t('article.minRead') }}</span>
      </div>
      <h1 class="article-title">{{ post.title }}</h1>
      <div class="chip-row" v-if="post.category || post.tags?.length">
        <span
          v-for="tag in post.tags"
          :key="tag"
          class="chip chip-tag"
          :style="tagColorStyles(tag)"
        >
          #{{ tag }}
        </span>
      </div>
      <p v-if="post.description" class="article-lead">{{ post.description }}</p>
    </div>

    <!-- Layout with TOC -->
    <div class="article-layout">
      <!-- Content -->
      <article class="prose">
        <ContentRenderer :value="post" />
      </article>

      <!-- Sidebar TOC -->
      <aside class="article-toc" v-if="post.body?.toc?.links?.length">
        <div class="toc-title">{{ $t('article.onThisPage') }}</div>
        <ul class="toc-list">
          <li
            v-for="link in post.body.toc.links"
            :key="link.id"
            class="toc-item"
            :class="`depth-${link.depth}`"
          >
            <a :href="`#${link.id}`">{{ link.text }}</a>
            <ul v-if="link.children?.length" class="toc-list" style="margin-top: 8px">
              <li
                v-for="child in link.children"
                :key="child.id"
                class="toc-item depth-3"
              >
                <a :href="`#${child.id}`">{{ child.text }}</a>
              </li>
            </ul>
          </li>
        </ul>

        <!-- Share -->
        <div class="toc-share">
          <div class="toc-share-title">{{ $t('article.share') }}</div>
          <div class="toc-share-links">
            <a :href="`https://twitter.com/intent/tweet?text=${encodeURIComponent(post.title)}&url=${encodeURIComponent(shareUrl)}`" target="_blank" rel="noopener" title="Twitter/X">
              <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor">
                <path d="M12.6.75h2.454l-5.36 6.142L16 15.25h-4.937l-3.867-5.07-4.425 5.07H.316l5.733-6.57L0 .75h5.063l3.495 4.633L12.601.75Zm-.86 13.028h1.36L4.323 2.145H2.865l8.875 11.633Z"/>
              </svg>
            </a>
            <a :href="`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`" target="_blank" rel="noopener" title="LinkedIn">
              <IconLinkedin />
            </a>
          </div>
        </div>
      </aside>
    </div>
  </div>
  <div v-else class="container" style="padding: 4rem 0; text-align: center; color: var(--text-muted)">
    Post não encontrado.
  </div>
</template>

<script setup>
const { locale, t } = useI18n()
const route = useRoute()

const slug = route.params.slug
const path = `/${locale.value}/blog/${slug}`
const siteBaseUrl = 'https://fernanduandrade.com'
const canonicalUrl = computed(() => `${siteBaseUrl}${route.path}`)

const { data: post } = await useAsyncData(`post-${locale.value}-${slug}`, () =>
  queryContent(path).findOne()
)

const readingTime = computed(() => {
  if (!post.value) return 0

  if (post.value.readingTime) return Number(post.value.readingTime)

  const rawContent = extractArticleText(post.value)
  return calculateReadingTime(rawContent)
})

const categoryKey = computed(() => post.value?.category?.toString().trim().toLowerCase())
const categoryLabel = computed(() => {
  const key = categoryKey.value
  if (!key) return ''

  const translation = t(`blog.categories.${key}`)
  if (translation && translation !== `blog.categories.${key}`) return translation

  const rawCategory = post.value?.category?.toString().trim() || ''
  return rawCategory
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .replace(/[-_]/g, ' ')
    .replace(/\b\w/g, (char) => char.toUpperCase())
})

const categoryChipStyle = computed(() => {
  if (!post.value?.category) return {}
  return tagColorStyles(post.value.category)
})

const keywords = computed(() => {
  const category = post.value?.category
  const tags = post.value?.tags ?? []
  return [...new Set([category, ...tags].filter(Boolean))].join(', ')
})

const fallbackDescription = computed(() => {
  if (post.value?.description) return post.value.description

  const raw = extractArticleText(post.value)
  const trimmed = raw.replace(/\s+/g, ' ').trim().slice(0, 160)
  return trimmed || 'Article by Fernando Andrade on software architecture, distributed systems, cloud, GIS, and engineering.'
})

if (!post.value) {
  navigateTo(`/${locale.value}/blog`)
}

onMounted(() => {
  if (!process.client) return

  document.querySelectorAll('article.prose pre').forEach(pre => {
    if (pre.querySelector('.code-copy-button')) return

    const button = document.createElement('button')
    button.type = 'button'
    button.className = 'code-copy-button'
    button.textContent = t('article.copy')

    button.addEventListener('click', async () => {
      const code = pre.querySelector('code')?.innerText || ''
      if (!code) return

      try {
        await navigator.clipboard.writeText(code)
        button.textContent = t('article.copied')
        window.setTimeout(() => {
          button.textContent = t('article.copy')
        }, 1500)
      } catch (err) {
        console.error('Copy failed', err)
      }
    })

    pre.style.position = 'relative'
    pre.appendChild(button)
  })
})

if (post.value) {
  useSeoMeta({
    title: `${post.value.title} — Fernando Andrade`,
    description: post.value.description || fallbackDescription.value,
    ogTitle: post.value.title,
    ogDescription: post.value.description || fallbackDescription.value,
    ogType: 'article',
    ogUrl: canonicalUrl.value,
    twitterCard: 'summary_large_image',
    twitterTitle: post.value.title,
    twitterDescription: post.value.description || fallbackDescription.value,
    meta: [
      { name: 'keywords', content: keywords.value },
      { property: 'article:published_time', content: post.value.date },
      ...(post.value?.category ? [{ property: 'article:section', content: categoryLabel.value }] : []),
      ...(post.value?.tags?.map((tag) => ({ property: 'article:tag', content: tag })) ?? []),
    ],
    link: [{ rel: 'canonical', href: canonicalUrl.value }],
  })
}

const shareUrl = computed(() => canonicalUrl.value)

function formatDate(dateStr) {
  if (!dateStr) return ''
  const date = new Date(dateStr)
  const localeMap = { pt: 'pt-BR', en: 'en-US', es: 'es-ES' }
  return date.toLocaleDateString(localeMap[locale.value] || 'pt-BR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

function extractArticleText(article) {
  if (!article?.body?.children) return ''

  const walk = (node) => {
    if (typeof node === 'string') return node
    if (Array.isArray(node)) return node.map(walk).filter(Boolean).join(' ')

    if (node && typeof node === 'object') {
      if (typeof node.value === 'string') return node.value
      if (typeof node.text === 'string') return node.text

      const childText = Object.keys(node)
        .filter((key) => key !== 'props')
        .map((key) => walk(node[key]))
        .filter(Boolean)
        .join(' ')

      return childText
    }

    return ''
  }

  return walk(article.body.children)
}

function calculateReadingTime(content, wordsPerMinute = 250) {
  if (!content) return 0

  const plainText = String(content)
    .replace(/<[^>]+>/g, ' ')
    .replace(/[#>*`_\-]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()

  if (!plainText) return 0

  const words = plainText.split(/\s+/).filter(Boolean).length
  return Math.max(1, Math.ceil(words / wordsPerMinute))
}

function tagColorStyles(tag) {
  const palette = [
    { color: 'var(--accent-blue)', backgroundColor: 'rgba(56, 178, 207, 0.14)' },
    { color: 'var(--accent-orange)', backgroundColor: 'rgba(245, 130, 32, 0.14)' },
    { color: 'var(--accent-green)', backgroundColor: 'rgba(54, 194, 123, 0.14)' },
    { color: 'var(--accent-purple)', backgroundColor: 'rgba(161, 102, 255, 0.12)' },
    { color: 'var(--text)', backgroundColor: 'rgba(102, 112, 133, 0.12)' },
  ]
  const index = Array.from(tag.toString().trim().toLowerCase()).reduce((sum, char) => sum + char.charCodeAt(0), 0) % palette.length
  return palette[index]
}
</script>
