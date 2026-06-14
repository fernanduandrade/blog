<template>
  <div class="container">
    <div class="page-header">
      <h1 class="page-title">{{ $t('bookmarks.title') }}</h1>
      <p class="page-subtitle">{{ $t('bookmarks.subtitle') }}</p>
    </div>

    <section v-if="groupedBookmarks.length" class="bookmarks-wrap">
      <article
        v-for="group in groupedBookmarks"
        :key="group.key"
        class="bookmark-group"
      >
        <h2 class="bookmark-year">{{ group.label }}</h2>

        <ul class="bookmark-list">
          <li v-for="item in group.items" :key="`${group.key}-${item.link}`" class="bookmark-item">
            <span class="bookmark-date">{{ formatDate(item.date) }}</span>
            <a
              :href="item.link"
              target="_blank"
              rel="noopener noreferrer"
              :title="item.link"
              class="bookmark-link"
            >
              {{ item.link }}
            </a>
          </li>
        </ul>
      </article>
    </section>

    <p v-else class="bookmark-empty">{{ $t('bookmarks.empty') }}</p>
  </div>
</template>

<script setup>
const { locale, t } = useI18n()

useSeoMeta({
  title: 'Bookmarks — Fernando Andrade',
  description: t('bookmarks.subtitle'),
})

const { data: bookmarks } = await useFetch('/data/bookmarks.json')

const groupedBookmarks = computed(() => {
  const list = (bookmarks.value || [])
    .map((item) => ({
      ...item,
      dateObj: new Date(item.date),
    }))
    .filter((item) => !Number.isNaN(item.dateObj.getTime()))
    .sort((a, b) => b.dateObj - a.dateObj)

  const grouped = new Map()
  const monthFormatter = new Intl.DateTimeFormat(locale.value === 'pt' ? 'pt-BR' : locale.value === 'es' ? 'es-ES' : 'en-US', {
    month: 'long',
  })

  list.forEach((item) => {
    const year = item.dateObj.getFullYear()
    const month = item.dateObj.getMonth()
    const key = `${year}-${String(month + 1).padStart(2, '0')}`
    const label = `${year} · ${monthFormatter.format(item.dateObj)}`

    if (!grouped.has(key)) {
      grouped.set(key, { key, label, year, month, items: [] })
    }

    grouped.get(key).items.push(item)
  })

  return Array.from(grouped.values()).sort((a, b) => b.year - a.year || b.month - a.month)
})

function formatDate(dateStr) {
  const date = new Date(dateStr)
  return new Intl.DateTimeFormat(locale.value === 'pt' ? 'pt-BR' : locale.value === 'es' ? 'es-ES' : 'en-US', {
    day: 'numeric',
    month: 'short',
  }).format(date)
}
</script>
