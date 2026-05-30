<template>
  <nav class="nav">
    <div class="container nav-inner">
      <!-- Logo -->
      <NuxtLinkLocale to="/" class="nav-logo">FA</NuxtLinkLocale>

      <!-- Links -->
      <ul class="nav-links">
        <li>
          <NuxtLinkLocale to="/" :class="{ active: isActive('/') }">{{ $t('nav.home') }}</NuxtLinkLocale>
        </li>
        <li>
          <NuxtLinkLocale to="/blog" :class="{ active: isActive('/blog') }">{{ $t('nav.blog') }}</NuxtLinkLocale>
        </li>
        <li>
          <NuxtLinkLocale to="/projects" :class="{ active: isActive('/projects') }">{{ $t('nav.projects') }}</NuxtLinkLocale>
        </li>
        <li>
          <NuxtLinkLocale to="/now" :class="{ active: isActive('/now') }">{{ $t('nav.now') }}</NuxtLinkLocale>
        </li>
        <li>
          <NuxtLinkLocale to="/changelog" :class="{ active: isActive('/changelog') }">{{ $t('nav.changelog') }}</NuxtLinkLocale>
        </li>
      </ul>

      <!-- Actions -->
      <div class="nav-actions">
        <!-- Language Switcher -->
        <LangSwitcher />

        <!-- Theme Toggle -->
        <button class="icon-btn" @click="toggleTheme" :title="isDark ? 'Switch to light' : 'Switch to dark'">
          <IconSun v-if="isDark" />
          <IconMoon v-else />
        </button>
      </div>
    </div>
  </nav>
</template>

<script setup>
const route = useRoute()
const { locale, defaultLocale } = useI18n()
const colorMode = useColorMode()

const isDark = computed(() => colorMode.value === 'dark')

function localizedPath(path) {
  if (path === '/') return `/${locale.value}`
  return `/${locale.value}${path}`
}

function isActive(path) {
  const localized = localizedPath(path)

  if (path === '/') {
    return route.path === localized
  }

  return route.path === localized || route.path.startsWith(`${localized}/`)
}

function toggleTheme() {
  colorMode.preference = isDark.value ? 'light' : 'dark'
}
</script>
