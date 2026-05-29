<template>
  <div class="container now-page">
    <div class="page-header">
      <h1 class="page-title">{{ $t('now.title') }}</h1>
      <p class="page-subtitle">{{ $t('now.subtitle') }}</p>
    </div>

    <div class="now-with-image">
      <div>
        <!-- Focus -->
        <div class="now-section">
          <div class="now-section-title">
            <span>🎯</span>
            <span>{{ $t('now.sections.focus') }}</span>
          </div>
          <div class="now-section-content">{{ nowContent.focus }}</div>
        </div>

        <!-- Learning -->
        <div class="now-section">
          <div class="now-section-title">
            <span>📚</span>
            <span>{{ $t('now.sections.learning') }}</span>
          </div>
          <div class="now-section-content">{{ nowContent.learning }}</div>
        </div>

        <!-- Building -->
        <div class="now-section">
          <div class="now-section-title">
            <span>🔨</span>
            <span>{{ $t('now.sections.building') }}</span>
          </div>
          <div class="now-section-content">{{ nowContent.building }}</div>
        </div>

        <!-- Thinking About -->
        <div class="now-section">
          <div class="now-section-title">
            <span>💭</span>
            <span>{{ $t('now.sections.thinkingAbout') }}</span>
          </div>
          <div class="now-section-content">{{ nowContent.thinkingAbout }}</div>
        </div>

        <!-- Listening -->
        <div class="now-section">
          <div class="now-section-title">
            <span>🎵</span>
            <span>{{ $t('now.sections.listening') }}</span>
          </div>
          <div class="now-section-content">{{ nowContent.listening }}</div>
        </div>

        <p class="now-last-updated">{{ $t('now.lastUpdated') }} 28 de maio de 2026</p>
      </div>

      <!-- Decorative image placeholder -->
      <div class="now-image">
        <div style="width:100%;height:100%;display:flex;align-items:center;justify-content:center;color:var(--text-faint);font-size:0.8rem;background:var(--bg-subtle);">
          📸
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
const { locale, t } = useI18n()

useSeoMeta({
  title: `${t('now.title')} — Fernando Andrade`,
  description: t('now.subtitle'),
})

const nowContent = computed(() => {
  const l = locale.value
  return {
    focus: l === 'pt'
      ? 'Trabalhando em alguns projetos pequenos e experimentos. Tentando shipar mais e pensar menos.'
      : l === 'es'
        ? 'Trabajando en algunos proyectos pequeños y experimentos. Intentando lanzar más y pensar menos.'
        : "Working on a few small projects and experiments. Trying to ship more and overthink less.",
    learning: l === 'pt'
      ? 'Compiladores, programação de sistemas e como as coisas funcionam por baixo.'
      : l === 'es'
        ? 'Compiladores, programación de sistemas y cómo funcionan las cosas por dentro.'
        : 'Compilers, systems programming and how things work under the hood.',
    building: l === 'pt'
      ? 'Melhorando algumas das minhas ferramentas open source e trabalhando em uma nova ideia.'
      : l === 'es'
        ? 'Mejorando algunas de mis herramientas open source y trabajando en una nueva idea.'
        : 'Improving some of my open source tools and working on a new idea.',
    thinkingAbout: l === 'pt'
      ? 'Simplicidade, pensamento de longo prazo e construir um corpo de trabalho.'
      : l === 'es'
        ? 'Simplicidad, pensamiento a largo plazo y construir un cuerpo de trabajo.'
        : 'Simplicity, long-term thinking and building a body of work.',
    listening: l === 'pt'
      ? 'Lo-fi, ambient e um pouco de clássico.'
      : l === 'es'
        ? 'Lo-fi, ambient y un poco de clásico.'
        : 'Lo-fi, ambient and a bit of classical.',
  }
})
</script>
