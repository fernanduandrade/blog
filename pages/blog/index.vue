<template>
  <div class="container">
    <div class="page-header">
      <h1 class="page-title">{{ $t('blog.title') }}</h1>
      <p class="page-subtitle">{{ $t('blog.subtitle') }}</p>
    </div>

    <!-- Category filter -->
    <div class="filter-tabs">
      <button
        v-for="cat in categories"
        :key="cat.value"
        class="filter-tab"
        :class="{ active: activeCategory === cat.value }"
        @click="activeCategory = cat.value"
      >
        {{ cat.label }}
      </button>
    </div>

    <!-- Posts -->
    <div class="post-list">
      <NuxtLinkLocale
        v-for="post in filteredPosts"
        :key="post._path"
        :to="postHref(post)"
        class="post-item animate-in"
      >
        <span class="post-date">{{ formatDate(post.date) }}</span>
        <div class="post-info">
          <div class="post-title">{{ post.title }}</div>
          <div class="post-excerpt">{{ post.description }}</div>
        </div>
        <span v-if="post.category" class="post-tag" :class="post.category.toLowerCase()">
          {{ categoryLabel(post.category) }}
        </span>
      </NuxtLinkLocale>
    </div>
  </div>
</template>

<script setup>
const { locale, t } = useI18n()

useSeoMeta({
  title: `Blog — Fernando Andrade`,
  description: t('blog.subtitle'),
})

const activeCategory = ref('all')

const categories = computed(() => {
  const list = [{ value: 'all', label: t('blog.all') }]
  const seen = new Set()

  ;(posts.value || []).forEach((post) => {
    const category = post.category?.toString().trim().toLowerCase()
    if (!category || seen.has(category)) return
    seen.add(category)
    const label = t(`blog.categories.${category}`) ||
      `${category.charAt(0).toUpperCase()}${category.slice(1)}`
    list.push({ value: category, label })
  })

  return list
})

const { data: posts } = await useAsyncData(`blog-posts-${locale.value}`, () =>
  queryContent(`/${locale.value}/blog`)
    .sort({ date: -1 })
    .find()
)

const filteredPosts = computed(() => {
  const all = posts.value || []
  if (activeCategory.value === 'all') return all
  return all.filter(p => p.category?.toLowerCase() === activeCategory.value)
})

function postHref(post) {
  if (!post?._path) return '/blog'
  return post._path
}

function formatDate(dateStr) {
  if (!dateStr) return ''
  const date = new Date(dateStr)
  const localeMap = { pt: 'pt-BR', en: 'en-US', es: 'es-ES' }
  return date.toLocaleDateString(localeMap[locale.value] || 'pt-BR', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

function formatCategory(category) {
  return category
    .toString()
    .trim()
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .replace(/[-_]/g, ' ')
    .replace(/\b\w/g, (char) => char.toUpperCase())
}

function categoryLabel(category) {
  if (!category) return ''
  const key = category.toString().trim().toLowerCase()
  const translation = t(`blog.categories.${key}`)
  if (translation && translation !== `blog.categories.${key}`) return translation
  return formatCategory(category)
}
</script>
