<template>
  <div class="error-container">
    <div class="error-content">
      <h1 class="error-title">404</h1>
      <p class="error-message">{{ $t('notFound.message') ?? 'Página não encontrada' }}</p>
      <p class="error-description">{{ $t('notFound.description') ?? 'A página que você está procurando não existe.' }}</p>
      <div class="error-actions">
        <NuxtLinkLocale to="/" class="error-button">
          {{ $t('notFound.backHome') ?? 'Voltar para o início' }}
        </NuxtLinkLocale>
        <NuxtLinkLocale to="/blog" class="error-button secondary">
          {{ $t('notFound.backBlog') ?? 'Voltar para o blog' }}
        </NuxtLinkLocale>
      </div>
    </div>
  </div>
</template>

<script setup>
definePageMeta({
  layout: 'default',
})

const { t } = useI18n()

useHead({
  title: '404 - Página não encontrada',
})
</script>

<style scoped>
.error-container {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  padding: 2rem;
}

.error-content {
  text-align: center;
  max-width: 600px;
}

.error-title {
  font-size: 8rem;
  font-weight: 700;
  margin: 0;
  color: var(--text-primary);
  line-height: 1;
}

.error-message {
  font-size: 1.875rem;
  margin: 1rem 0 0.5rem;
  color: var(--text-primary);
  font-weight: 600;
}

.error-description {
  font-size: 1rem;
  color: var(--text-muted);
  margin-bottom: 2rem;
}

.error-actions {
  display: flex;
  gap: 1rem;
  justify-content: center;
  flex-wrap: wrap;
}

.error-button {
  display: inline-block;
  padding: 0.75rem 1.5rem;
  border-radius: 0.5rem;
  font-weight: 500;
  text-decoration: none;
  transition: all 0.2s;
  background-color: var(--brand);
  color: white;
}

.error-button:hover {
  opacity: 0.9;
  transform: translateY(-2px);
}

.error-button.secondary {
  background-color: var(--bg-secondary);
  color: var(--text-primary);
  border: 1px solid var(--border);
}

.error-button.secondary:hover {
  background-color: var(--bg-tertiary);
}

@media (max-width: 640px) {
  .error-title {
    font-size: 4rem;
  }

  .error-message {
    font-size: 1.5rem;
  }

  .error-actions {
    flex-direction: column;
  }

  .error-button {
    width: 100%;
  }
}
</style>
