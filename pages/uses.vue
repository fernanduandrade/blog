<template>
  <div class="container">
    <div class="page-header">
      <h1 class="page-title">{{ $t('uses.title') }}</h1>
      <p class="page-subtitle">{{ $t('uses.subtitle') }}</p>
    </div>

    <div class="uses-grid">
      <!-- Development -->
      <div>
        <h2 class="uses-category-title">{{ $t('uses.development') }}</h2>
        <div v-for="item in devTools" :key="item.name" class="uses-item">
          <div class="uses-icon">{{ item.icon }}</div>
          <div class="uses-info">
            <div class="uses-name">{{ item.name }}</div>
            <div class="uses-desc">{{ item.desc }}</div>
          </div>
        </div>
      </div>

      <!-- Work & Communication + Other -->
      <div>
        <h2 class="uses-category-title">{{ $t('uses.workCommunication') }}</h2>
        <div v-for="item in workTools" :key="item.name" class="uses-item">
          <div class="uses-icon">{{ item.icon }}</div>
          <div class="uses-info">
            <div class="uses-name">{{ item.name }}</div>
            <div class="uses-desc">{{ item.desc }}</div>
          </div>
        </div>

        <h2 class="uses-category-title">{{ $t('uses.productivity') }}</h2>
        <div v-for="item in productivityTools" :key="item.name" class="uses-item">
          <div class="uses-icon">{{ item.icon }}</div>
          <div class="uses-info">
            <div class="uses-name">{{ item.name }}</div>
            <div class="uses-desc">{{ item.desc }}</div>
          </div>
        </div>

        <h2 class="uses-category-title">{{ $t('uses.other') }}</h2>
        <div v-for="item in otherTools" :key="item.name" class="uses-item">
          <div class="uses-icon">{{ item.icon }}</div>
          <div class="uses-info">
            <div class="uses-name">{{ item.name }}</div>
            <div class="uses-desc">{{ item.desc }}</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
const { locale, t } = useI18n()

useSeoMeta({
  title: `${t('uses.title')} — Fernando Andrade`,
  description: t('uses.subtitle'),
})

const desc = (pt, en, es) => {
  if (locale.value === 'pt') return pt
  if (locale.value === 'es') return es
  return en
}

const devTools = computed(() => [
  { icon: '💻', name: 'MacBook Pro 14" M3 Pro', desc: desc('Meu driver diário.', 'My daily driver.', 'Mi equipo principal.') },
  { icon: '⌨️', name: 'VS Code', desc: desc('Com algumas extensões.', 'With a few extensions.', 'Con algunas extensiones.') },
  { icon: '🖥️', name: 'iTerm2', desc: desc('Porque o terminal padrão não é suficiente.', 'Because the default terminal is not enough.', 'Porque el terminal por defecto no es suficiente.') },
  { icon: '🐙', name: 'Git + GitHub', desc: desc('Para controle de versão e colaboração.', 'For version control and collaboration.', 'Para control de versiones y colaboración.') },
])

const productivityTools = computed(() => [
  { icon: '🪨', name: 'Obsidian', desc: desc('Para notas e base de conhecimento pessoal.', 'For notes and personal knowledge base.', 'Para notas y base de conocimiento personal.') },
  { icon: '3️⃣', name: 'Things 3', desc: desc('Para gerenciar tarefas e projetos.', 'To manage tasks and projects.', 'Para gestionar tareas y proyectos.') },
  { icon: '🚀', name: 'Raycast', desc: desc('Para um workflow mais rápido.', 'For a faster workflow.', 'Para un flujo de trabajo más rápido.') },
  { icon: '📋', name: 'Notion', desc: desc('Para docs, planejamento e acompanhamento.', 'For docs, planning and tracking.', 'Para docs, planificación y seguimiento.') },
])

const workTools = computed(() => [
  { icon: '💬', name: 'Slack', desc: desc('Para comunicação em equipe.', 'For team communication.', 'Para comunicación en equipo.') },
  { icon: '📊', name: 'Linear', desc: desc('Para issues e rastreamento de projetos.', 'For issues and project tracking.', 'Para issues y seguimiento de proyectos.') },
  { icon: '📧', name: 'Google Workspace', desc: desc('Gmail, Calendar, Drive.', 'Gmail, Calendar, Drive.', 'Gmail, Calendar, Drive.') },
  { icon: '📹', name: 'Zoom', desc: desc('Para chamadas e reuniões.', 'For calls and meetings.', 'Para llamadas y reuniones.') },
])

const otherTools = computed(() => [
  { icon: '🔤', name: 'JetBrains Mono', desc: desc('Minha fonte favorita.', 'My favorite font.', 'Mi fuente favorita.') },
  { icon: '🖱️', name: 'Logitech MX Master 3', desc: desc('O melhor mouse.', 'The best mouse.', 'El mejor ratón.') },
  { icon: '⌨️', name: 'Keychron K2', desc: desc('Mecânico e simples.', 'Mechanical and simple.', 'Mecánico y simple.') },
])
</script>
