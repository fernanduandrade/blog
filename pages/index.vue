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
              {{ $t(`blog.categories.${post.category.toLowerCase()}`) }}
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
          <NuxtLinkLocale
            v-for="project in featuredProjects"
            :key="project._path"
            :to="project.url || project._path"
            class="project-card animate-in"
            :target="project.url ? '_blank' : undefined"
            :rel="project.url ? 'noopener' : undefined"
          >
            <div class="project-icon">{{ project.icon }}</div>
            <div class="project-name">{{ project.name }}</div>
            <div class="project-desc">{{ project.description }}</div>
            <div class="project-tech">
              <span class="tech-dot"></span>
              {{ project.tech }}
            </div>
          </NuxtLinkLocale>
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
          <span>{{ currentNow }}</span>
        </div>
      </section>
    </div>
  </div>
</template>

<script setup>
const { locale, t } = useI18n()

// SEO
useSeoMeta({
  title: 'Fernando Andrade — Software Engineer',
  description: 'Software Engineer from Brazil. I build useful things, contribute to open source and write about software, productivity and systems.',
  ogTitle: 'Fernando Andrade — Software Engineer',
  ogDescription: 'Software Engineer from Brazil. Building useful software and writing about code, systems and productivity.',
  ogType: 'website',
  twitterCard: 'summary',
})

// Fetch posts
const { data: posts } = await useAsyncData(`home-posts-${locale.value}`, () =>
  queryContent(`/${locale.value}/blog`)
    .sort({ date: -1 })
    .limit(3)
    .find()
)

const latestPosts = computed(() => posts.value || [])

function postHref(post) {
  if (!post?._path) return '/blog'
  return locale.value === 'pt' ? post._path.replace(/^\/pt/, '') : post._path
}

// Featured projects (static data)
const featuredProjects = computed(() => [
  {
    icon: 'U',
    name: 'Letter U',
    description: locale.value === 'pt'
      ? 'Uma plataforma de blogging minimalista para escritores.'
      : locale.value === 'es'
        ? 'Una plataforma de blogging minimalista para escritores.'
        : 'A minimal blogging platform built for writers.',
    tech: 'TypeScript',
    url: 'https://github.com/fernandoandrade/letter-u',
  },
  {
    icon: '>_',
    name: 'Unbuild',
    description: locale.value === 'pt'
      ? 'Ferramenta CLI para scaffoldar e gerenciar side projects.'
      : locale.value === 'es'
        ? 'Herramienta CLI para crear y gestionar proyectos propios.'
        : 'CLI tool to scaffold and manage side projects.',
    tech: 'TypeScript',
    url: 'https://github.com/fernandoandrade/unbuild',
  },
  {
    icon: '📖',
    name: 'ReadKit',
    description: locale.value === 'pt'
      ? 'Um app de lista de leitura para salvar e organizar artigos.'
      : locale.value === 'es'
        ? 'Una app de lista de lectura para guardar y organizar artículos.'
        : 'A reading list app to save and organize articles.',
    tech: 'TypeScript',
    url: 'https://github.com/fernandoandrade/readkit',
  },
])

const currentNow = computed(() => {
  if (locale.value === 'pt') return 'Trabalhando em novas ideias, lendo sobre compiladores e programação de sistemas.'
  if (locale.value === 'es') return 'Trabajando en nuevas ideas, leyendo sobre compiladores y programación de sistemas.'
  return 'Working on new ideas, reading about compilers and systems programming.'
})

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
