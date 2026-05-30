import { useAsyncData } from 'nuxt/app'

export function useGithubProjects() {
  return useAsyncData('github-projects', () => $fetch('/api/projects'))
}
