import { defineEventHandler, setHeader } from 'h3'

type GitHubRepo = {
  name: string
  description: string | null
  html_url: string
  homepage: string | null
  language: string | null
  fork: boolean
  archived: boolean
}

type Project = {
  icon?: string
  name: string
  description: string
  tech: string[]
  repository: string
  pageUrl?: string
}

type ProjectWithCategory = Project & {
  category: string
  demo?: string
}

const projectCategoryMap: Record<string, string> = {
  'letter-u': 'open-source',
  unbuild: 'tools',
  readkit: 'side-projects',
  dotfiles: 'open-source',
  'httpie-config': 'tools',
}

export default defineEventHandler(async (event) => {
  const username = 'fernanduandrade'
  const repos = await $fetch<GitHubRepo[]>(
    `https://api.github.com/users/${username}/repos`,
    {
      headers: {
        Accept: 'application/vnd.github+json',
      },
      params: {
        per_page: '20',
        sort: 'updated',
        direction: 'desc',
      },
    }
  )

  const projects: ProjectWithCategory[] = repos
    .filter((repo) => !repo.fork && !repo.archived && repo.name !== 'blog' && repo.name !== 'fernanduandrade')
    .slice(0, 20)
    .map((repo) => ({
      icon: repo.name?.charAt(0).toUpperCase(),
      name: repo.name,
      description: repo.description || repo.name,
      tech: repo.language ? [repo.language] : [],
      repository: repo.html_url,
      pageUrl: repo.homepage?.trim() || undefined,
      demo: repo.homepage?.trim() || undefined,
      category: projectCategoryMap[repo.name] || 'open-source',
    }))

  setHeader(event, 'Cache-Control', 'public, max-age=60, s-maxage=300')
  return projects
})
