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
          {{ $t(`blog.categories.${post.category.toLowerCase()}`) }}
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

const categories = computed(() => [
  { value: 'all', label: t('blog.all') },
  { value: 'engineering', label: t('blog.categories.engineering') },
  { value: 'productivity', label: t('blog.categories.productivity') },
  { value: 'building', label: t('blog.categories.building') },
  { value: 'life', label: t('blog.categories.life') },
])

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
  return locale.value === 'pt' ? post._path.replace(/^\/pt/, '') : post._path
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
</script>
