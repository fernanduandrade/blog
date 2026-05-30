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
            v-if="project.repository"
            :href="project.repository"
            target="_blank"
            rel="noopener"
            class="project-link-btn"
          >
            <IconGithub />
            {{ $t('projects.viewOnGithub') }}
          </a>
          <a
            v-if="project.pageUrl"
            :href="project.pageUrl"
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
import { useGithubProjects } from '~/composables/useGithubProjects'

const { locale, t } = useI18n()

useSeoMeta({
  title: `${t('projects.title')} — Fernando Andrade`,
  description: t('projects.subtitle'),
})

const { data: githubProjects } = useGithubProjects()
const activeFilter = ref('all')

const filters = computed(() => [
  { value: 'all', label: t('projects.all') },
  { value: 'open-source', label: t('projects.openSource') },
  { value: 'side-projects', label: t('projects.sideProjects') },
  { value: 'tools', label: t('projects.tools') },
])

const filteredProjects = computed(() => {
  const source = githubProjects.value || []

  if (activeFilter.value === 'all') return source
  return source.filter(p => p.category === activeFilter.value)
})
</script>
