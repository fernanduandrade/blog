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
            date: '2026-06-14',
            type: 'launch',
            title: locale.value === 'pt'
                ? 'Adicionado seção de bookmarks'
                : locale.value === 'es'
                    ? 'Sección de marcadores añadida'
                    : 'Bookmarks section added',
            description: locale.value === 'pt'
                ? 'Agora a página de bookmarks exibe uma lista de links salvos, agrupados por mês e ano, com data e título.'
                : locale.value === 'es'
                    ? 'Ahora la página de marcadores muestra una lista de enlaces guardados, agrupados por mes y año, con fecha y título.'
                    : 'The bookmarks page now displays a list of saved links, grouped by month and year, with date and title.',
            details: locale.value === 'pt'
                ? [
                    'Exibição de bookmarks salvos', 
                ]
                : locale.value === 'es'
                    ? [
                        'Visualización de marcadores guardados',
                    ]
                    : [
                        'Display of saved bookmarks',
                    ],
        },
        {
            date: '2026-06-06',
            type: 'post',
            title: locale.value === 'pt'
                ? 'Novo artigo: De 6 horas para 40 segundos'
                : locale.value === 'es'
                    ? 'Nuevo artículo: De 6 horas a 40 segundos'
                    : 'New article: From 6 Hours to 40 Seconds',
            description: locale.value === 'pt'
                ? 'Um índice composto transformou um job crítico de produção de 6 horas para 40 segundos e mostrou como otimização de query impacta o dia a dia.'
                : locale.value === 'es'
                    ? 'Un índice compuesto transformó un job crítico de producción de 6 horas a 40 segundos y mostró cómo la optimización de consultas impacta el día a día.'
                    : 'A composite index turned a critical production job from 6 hours to 40 seconds and showed how query optimization changes real-world operations.',
            details: locale.value === 'pt'
                ? [
                    'Otimização de query em PostgreSQL',
                    'Uso prático de índices compostos',
                    'Aprendizado de performance em produção',
                ]
                : locale.value === 'es'
                    ? [
                        'Optimización de consultas en PostgreSQL',
                        'Uso práctico de índices compuestos',
                        'Aprendizaje de rendimiento en producción',
                    ]
                    : [
                        'PostgreSQL query optimization',
                        'Practical composite index usage',
                        'Production performance lessons',
                    ],
        },
        {
            date: '2026-03-12',
            type: 'post',
            title: locale.value === 'pt'
                ? 'Novo artigo: Do commit ao deploy com CI/CD na AWS'
                : locale.value === 'es'
                    ? 'Nuevo artículo: Del commit al despliegue con CI/CD en AWS'
                    : 'New article: From Commit to Deployment with CI/CD on AWS',
            description: locale.value === 'pt'
                ? 'Um guia completo para montar pipeline de CI/CD com GitHub Actions, ECS e Terraform para automatizar deploys na AWS.'
                : locale.value === 'es'
                    ? 'Una guía completa para montar un pipeline de CI/CD con GitHub Actions, ECS y Terraform para automatizar despliegues en AWS.'
                    : 'A complete guide to setting up a CI/CD pipeline with GitHub Actions, ECS, and Terraform to automate AWS deployments.',
            details: locale.value === 'pt'
                ? [
                    'Pipeline CI/CD com GitHub Actions',
                    'Infraestrutura como código com Terraform',
                    'Deploy automatizado em ECS Fargate',
                ]
                : locale.value === 'es'
                    ? [
                        'Pipeline CI/CD con GitHub Actions',
                        'Infraestructura como código con Terraform',
                        'Despliegue automatizado en ECS Fargate',
                    ]
                    : [
                        'CI/CD pipeline with GitHub Actions',
                        'Infrastructure as code with Terraform',
                        'Automated deployment on ECS Fargate',
                    ],
        },
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
