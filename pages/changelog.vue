<template>
    <div>
        <div class="container">
            <!-- Page Header -->
            <div class="page-header">
                <h1 class="page-title">{{ $t('changelog.title') }}</h1>
                <p class="page-subtitle">{{ $t('changelog.subtitle') }}</p>
            </div>

            <!-- Changelog Timeline -->
            <div class="changelog-timeline">
                <div v-for="(entry, index) in changelogEntries" :key="index" class="changelog-entry animate-in">
                    <!-- Date -->
                    <div class="changelog-date">
                        {{ formatDate(entry.date) }}
                    </div>

                    <!-- Content -->
                    <div class="changelog-content">
                        <!-- Badge -->
                        <span class="changelog-badge" :class="`badge-${entry.type}`">
                            {{ $t(`changelog.types.${entry.type}`) }}
                        </span>

                        <!-- Title -->
                        <h3 class="changelog-title">{{ entry.title }}</h3>

                        <!-- Description -->
                        <p class="changelog-description">{{ entry.description }}</p>

                        <!-- Details if exist -->
                        <ul v-if="entry.details" class="changelog-details">
                            <li v-for="(detail, i) in entry.details" :key="i">{{ detail }}</li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
const { locale, t } = useI18n()

// SEO
useSeoMeta({
    title: `${t('changelog.title')} — Fernando Andrade`,
    description: t('changelog.subtitle'),
    ogTitle: t('changelog.title'),
    ogDescription: t('changelog.subtitle'),
    ogType: 'website',
})

// Changelog entries data
const changelogEntries = computed(() => {
    const entries = [
        {
            date: '2026-05-30',
            type: 'update',
            title: locale.value === 'pt'
                ? 'API de projetos adicionada'
                : locale.value === 'es'
                    ? 'API de proyectos añadida'
                    : 'Projects API added',

            description: locale.value === 'pt'
                ? 'Agora a página de projetos consome a API do GitHub e ignora o repositório README do perfil.'
                : locale.value === 'es'
                    ? 'Ahora la página de proyectos consume la API de GitHub y omite el repositorio README del perfil.'
                    : 'The projects page now consumes the GitHub API and ignores the profile README repo.',

            details: locale.value === 'pt'
                ? [
                    'Publicação do portfolio',
                    'Consumo de API para exibir projetos',
                    'Ignora o repositório fernanduandrade',
                ]
                : locale.value === 'es'
                    ? [
                        'Publicación del portafolio',
                        'Consumo de API para mostrar proyectos',
                        'Ignora el repositorio fernanduandrade',
                    ]
                    : [
                        'Portfolio published',
                        'API consumption to display projects',
                        'Ignore fernanduandrade repo',
                    ],
        },
        {
            date: '2026-05-29',
            type: 'launch',
            title: locale.value === 'pt'
                ? 'Portfolio lançado'
                : locale.value === 'es'
                    ? 'Portafolio lanzado'
                    : 'Portfolio launched',

            description: locale.value === 'pt'
                ? 'Primeira versão pública do meu portfolio pessoal, com blog técnico, projetos, página now e suporte multilíngue.'
                : locale.value === 'es'
                    ? 'Primera versión pública de mi portafolio personal, con blog técnico, proyectos, página now y soporte multilingüe.'
                    : 'First public version of my personal portfolio, featuring a technical blog, projects, now page, and multilingual support.',

            details: locale.value === 'pt'
                ? [
                    'Blog baseado em Markdown',
                    'Suporte para português, inglês e espanhol',
                    'Tema claro e escuro',
                    'SEO otimizado',
                    'Página de projetos e changelog',
                ]
                : locale.value === 'es'
                    ? [
                        'Blog basado en Markdown',
                        'Soporte para portugués, inglés y español',
                        'Tema claro y oscuro',
                        'SEO optimizado',
                        'Página de proyectos y changelog',
                    ]
                    : [
                        'Markdown-based blog',
                        'Portuguese, English and Spanish support',
                        'Light and dark theme',
                        'SEO optimized',
                        'Projects and changelog pages',
                    ],
        },
    ]

    return entries
})

function formatDate(dateStr) {
    const date = new Date(dateStr)
    const localeMap = { pt: 'pt-BR', en: 'en-US', es: 'es-ES' }
    return date.toLocaleDateString(localeMap[locale.value] || 'pt-BR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    })
}
</script>

<style scoped>
.page-header {
    margin-bottom: 4rem;
    padding: 2rem 0;
}

.page-title {
    font-size: 2.5rem;
    font-weight: 700;
    margin: 0 0 0.5rem;
    color: var(--text-primary);
    font-family: 'DM Serif Display', serif;
}

.page-subtitle {
    font-size: 1.1rem;
    color: var(--text-muted);
    margin: 0;
}

.changelog-timeline {
    display: flex;
    flex-direction: column;
    gap: 2.5rem;
}

.changelog-entry {
    display: grid;
    grid-template-columns: 140px 1fr;
    gap: 2rem;
    padding-bottom: 2rem;
    border-bottom: 1px solid var(--border);
    animation: fadeInUp 0.6s ease-out both;
}

.changelog-entry:last-child {
    border-bottom: none;
}

.changelog-date {
    font-size: 0.95rem;
    font-weight: 500;
    color: var(--text-muted);
    padding-top: 0.25rem;
}

.changelog-content {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
}

.changelog-badge {
    display: inline-flex;
    align-items: center;
    width: fit-content;
    padding: 0.25rem 0.75rem;
    border-radius: 0.375rem;
    font-size: 0.75rem;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.05em;
}

.badge-post {
    background-color: rgb(59, 130, 246 / 0.1);
    color: rgb(59, 130, 246);
}

.badge-feature {
    background-color: rgb(34, 197, 94 / 0.1);
    color: rgb(34, 197, 94);
}

.badge-fix {
    background-color: rgb(245, 158, 11 / 0.1);
    color: rgb(245, 158, 11);
}

.badge-update {
    background-color: rgb(139, 92, 246 / 0.1);
    color: rgb(139, 92, 246);
}

.badge-launch {
    background-color: rgb(236, 72, 153 / 0.1);
    color: rgb(236, 72, 153);
}

.changelog-title {
    font-size: 1.25rem;
    font-weight: 600;
    margin: 0;
    color: var(--text-primary);
}

.changelog-description {
    font-size: 0.95rem;
    color: var(--text-secondary);
    margin: 0;
    line-height: 1.6;
}

.changelog-details {
    margin: 0.75rem 0 0;
    padding-left: 1.5rem;
    list-style: disc;
}

.changelog-details li {
    font-size: 0.9rem;
    color: var(--text-secondary);
    margin-bottom: 0.375rem;
}

@media (max-width: 640px) {
    .page-header {
        margin-bottom: 2rem;
        padding: 1rem 0;
    }

    .page-title {
        font-size: 2rem;
    }

    .changelog-entry {
        grid-template-columns: 1fr;
        gap: 0.75rem;
    }

    .changelog-date {
        font-size: 0.85rem;
    }

    .changelog-title {
        font-size: 1.1rem;
    }
}

@keyframes fadeInUp {
    from {
        opacity: 0;
        transform: translateY(10px);
    }

    to {
        opacity: 1;
        transform: translateY(0);
    }
}
</style>
