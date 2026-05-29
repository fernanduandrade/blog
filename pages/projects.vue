<template>
  <div class="container">
    <div class="page-header">
      <h1 class="page-title">{{ $t('projects.title') }}</h1>
      <p class="page-subtitle">{{ $t('projects.subtitle') }}</p>
    </div>

    <!-- Filter -->
    <div class="filter-tabs projects-filter">
      <button
        v-for="f in filters"
        :key="f.value"
        class="filter-tab"
        :class="{ active: activeFilter === f.value }"
        @click="activeFilter = f.value"
      >
        {{ f.label }}
      </button>
    </div>

    <!-- Grid -->
    <div class="projects-grid-full">
      <div
        v-for="project in filteredProjects"
        :key="project.name"
        class="project-card-full animate-in"
      >
        <div class="project-icon">{{ project.icon }}</div>
        <div class="project-name">{{ project.name }}</div>
        <div class="project-desc">{{ project.description }}</div>
        <div class="project-tech">
          <span class="tech-dot"></span>
          <span>{{ project.tech.join(' · ') }}</span>
        </div>
        <div class="project-links">
          <a
            v-if="project.github"
            :href="project.github"
            target="_blank"
            rel="noopener"
            class="project-link-btn"
          >
            <IconGithub />
            {{ $t('projects.viewOnGithub') }}
          </a>
          <a
            v-if="project.demo"
            :href="project.demo"
            target="_blank"
            rel="noopener"
            class="project-link-btn"
          >
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M5 2H2a1 1 0 0 0-1 1v7a1 1 0 0 0 1 1h7a1 1 0 0 0 1-1V7M8 1h3m0 0v3m0-3L5 6"/></svg>
            {{ $t('projects.viewProject') }}
          </a>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
const { locale, t } = useI18n()

useSeoMeta({
  title: `${t('projects.title')} — Fernando Andrade`,
  description: t('projects.subtitle'),
})

const activeFilter = ref('all')

const filters = computed(() => [
  { value: 'all', label: t('projects.all') },
  { value: 'open-source', label: t('projects.openSource') },
  { value: 'side-projects', label: t('projects.sideProjects') },
  { value: 'tools', label: t('projects.tools') },
])

const allProjects = computed(() => {
  const descriptions = {
    'letter-u': {
      pt: 'Uma plataforma de blogging minimalista construída para escritores.',
      en: 'A minimal blogging platform built for writers.',
      es: 'Una plataforma de blogging minimalista para escritores.',
    },
    'unbuild': {
      pt: 'Ferramenta CLI para scaffoldar e gerenciar side projects.',
      en: 'CLI tool to scaffold and manage side projects.',
      es: 'Herramienta CLI para crear y gestionar proyectos propios.',
    },
    'readkit': {
      pt: 'App de lista de leitura para salvar e organizar artigos.',
      en: 'A reading list app to save and organize articles.',
      es: 'App de lista de lectura para guardar y organizar artículos.',
    },
    'dotfiles': {
      pt: 'Meu ambiente de desenvolvimento pessoal e configurações.',
      en: 'My personal development environment and configuration.',
      es: 'Mi entorno de desarrollo personal y configuración.',
    },
    'httpc': {
      pt: 'Minha configuração pessoal HTTPie e atalhos.',
      en: 'My personal HTTPie configuration and shortcuts.',
      es: 'Mi configuración personal de HTTPie y atajos.',
    },
  }

  const l = locale.value

  return [
    { icon: 'U', name: 'Letter U', description: descriptions['letter-u'][l], tech: ['TypeScript', 'Next.js', 'MDX'], category: 'open-source', github: 'https://github.com/fernandoandrade/letter-u', demo: 'https://letteru.app' },
    { icon: '>_', name: 'Unbuild', description: descriptions['unbuild'][l], tech: ['TypeScript', 'Node.js'], category: 'tools', github: 'https://github.com/fernandoandrade/unbuild' },
    { icon: '📖', name: 'ReadKit', description: descriptions['readkit'][l], tech: ['TypeScript', 'Next.js'], category: 'side-projects', github: 'https://github.com/fernandoandrade/readkit' },
    { icon: '⚙️', name: 'Dotfiles', description: descriptions['dotfiles'][l], tech: ['Nix', 'Home Manager'], category: 'open-source', github: 'https://github.com/fernandoandrade/dotfiles' },
    { icon: '🔧', name: 'HTTPie Config', description: descriptions['httpc'][l], tech: ['HTTPie'], category: 'tools', github: 'https://github.com/fernandoandrade/httpie-config' },
  ]
})

const filteredProjects = computed(() => {
  if (activeFilter.value === 'all') return allProjects.value
  return allProjects.value.filter(p => p.category === activeFilter.value)
})
</script>
