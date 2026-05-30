<template>
  <div>
    <div class="container">
      <!-- Hero -->
      <section class="hero animate-in">
        <h1 class="hero-name">Fernando Andrade</h1>
        <p class="hero-role">{{ $t('hero.role') }}</p>
        <p class="hero-bio">{{ $t('hero.bio') }}</p>
        <div class="hero-links">
          <a href="https://github.com/fernanduandrade" target="_blank" rel="noopener" class="hero-link">
            <IconGithub /> GitHub
          </a>
          <a href="https://linkedin.com/in/fernanduandrade" target="_blank" rel="noopener" class="hero-link">
            <IconLinkedin /> LinkedIn
          </a>
          <a href="/feed.xml" class="hero-link">
            <IconRss /> RSS
          </a>
          <a href="mailto:fernandu.contact@gmail.com" class="hero-link">
            <IconEmail /> Email
          </a>
          <a
            :href="locale === 'pt' ? '/curriculum/CV_PT.pdf' : '/curriculum/CV_EN.pdf'"
            class="hero-link"
            :download="locale === 'pt' ? 'CV-PT-BR.pdf' : 'CV-EN.pdf'"
          >
            [ {{ $t('home.cvTitle') }} ]
          </a>
        </div>
      </section>

      <!-- Latest Posts -->
      <section class="section">
        <div class="section-header">
          <h2 class="section-title">{{ $t('home.latestPosts') }}</h2>
          <NuxtLinkLocale to="/blog" class="view-all">{{ $t('home.viewAllPosts') }}</NuxtLinkLocale>
        </div>
        <div class="post-list">
          <NuxtLinkLocale
            v-for="post in latestPosts"
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
      </section>

      <!-- Projects -->
      <section class="section">
        <div class="section-header">
          <h2 class="section-title">{{ $t('home.projects') }}</h2>
          <NuxtLinkLocale to="/projects" class="view-all">{{ $t('home.viewAllProjects') }}</NuxtLinkLocale>
        </div>
        <div class="projects-grid">
          <a
            v-for="project in featuredProjects"
            :key="project.repository"
            :href="projectHref(project)"
            class="project-card animate-in"
            target="_blank"
            rel="noopener"
          >
            <div class="project-icon">{{ project.icon }}</div>
            <div class="project-name">{{ project.name }}</div>
            <div class="project-desc">{{ project.description }}</div>
            <div class="project-tech">
              <span class="tech-dot"></span>
              {{ projectTech(project) }}
            </div>
          </a>
        </div>
      </section>

      <!-- Now -->
      <section class="section">
        <div class="section-header">
          <h2 class="section-title">{{ $t('home.now') }}</h2>
          <NuxtLinkLocale to="/now" class="view-all">{{ $t('home.moreOnNow') }}</NuxtLinkLocale>
        </div>
        <div class="now-item">
          <span class="now-dot"></span>
          <span>{{ t('now.sections.focus.content') }}</span>
        </div>
      </section>
    </div>
  </div>
</template>

<script setup>
import { useGithubProjects } from '~/composables/useGithubProjects'

const { locale, t } = useI18n()

// SEO
useSeoMeta({
  title: t('home.seo.title'),
  description: t('home.seo.description'),
  ogTitle: t('home.seo.ogTitle'),
  ogDescription: t('home.seo.ogDescription'),
  ogType: t('home.seo.ogType'),
  twitterCard: t('home.seo.twitterCard'),
})

// Fetch posts
const { data: posts } = await useAsyncData(`home-posts-${locale.value}`, () =>
  queryContent(`/${locale.value}/blog`)
    .sort({ date: -1 })
    .limit(3)
    .find()
)

const latestPosts = computed(() => posts.value || [])

const { data: githubProjects } = useGithubProjects()

const featuredProjects = computed(() => {
  return githubProjects.value ? githubProjects.value.slice(0, 3) : []
})

function projectHref(project) {
  return project.pageUrl || project.repository
}

function projectTech(project) {
  return project.tech.join(' · ')
}

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
