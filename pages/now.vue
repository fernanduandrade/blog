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
            <span>{{ $t('now.sections.focus.title') }}</span>
          </div>
          <div class="now-section-content">{{ $t('now.sections.focus.content') }}</div>
        </div>

        <!-- Learning -->
        <div class="now-section">
          <div class="now-section-title">
            <span>📚</span>
            <span>{{ $t('now.sections.learning.title') }}</span>
          </div>
          <div class="now-section-content">{{ $t('now.sections.learning.content') }}</div>
        </div>

        <!-- Building -->
        <div class="now-section">
          <div class="now-section-title">
            <span>🔨</span>
            <span>{{ $t('now.sections.building.title') }}</span>
          </div>
          <div class="now-section-content">{{ $t('now.sections.building.content') }}</div>
        </div>

        <!-- Thinking About -->
        <div class="now-section">
          <div class="now-section-title">
            <span>💭</span>
            <span>{{ $t('now.sections.thinkingAbout.title') }}</span>
          </div>
          <div class="now-section-content">{{ $t('now.sections.thinkingAbout.content') }}</div>
        </div>

        <!-- Listening -->
        <div class="now-section">
          <div class="now-section-title">
            <span>🎵</span>
            <span>{{ $t('now.sections.listening.title') }}</span>
          </div>
          <div class="now-section-content">{{ $t('now.sections.listening.content') }}</div>
          <a href="https://open.spotify.com/playlist/7da6nSZZus54BuWLQMoeKL?si=15717341272e4588" target="_blank" rel="noopener">
              {{ $t('now.sections.listening.playlistLabel') }}
          </a>
          <!-- Spotify embed -->
          <div class="spotify-embed">
            <iframe
              src="https://open.spotify.com/embed/playlist/7da6nSZZus54BuWLQMoeKL?si=15717341272e4588"
              width="100%"
              height="180"
              frameborder="0"
              allowtransparency="true"
              allow="encrypted-media; clipboard-write"
            ></iframe>
          </div>
        </div>

        <p class="now-last-updated">{{ $t('now.lastUpdated') }} {{ formatDate(lastUpdated) }}</p>
      </div>

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
const lastUpdated = '2026-05-28T00:00:00Z'

function formatDate(dateStr) {
  const date = new Date(dateStr)
  return date.toLocaleDateString(locale.value, { year: 'numeric', month: 'long', day: 'numeric' })
}

useSeoMeta({
  title: `${t('now.title')} — Fernando Andrade`,
  description: t('now.subtitle'),
})
</script>
