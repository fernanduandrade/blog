<template>
  <nav class="nav">
    <div class="container nav-inner">
      <!-- Logo -->
      <NuxtLinkLocale to="/" class="nav-logo">FA</NuxtLinkLocale>

      <!-- Links -->
      <ul class="nav-links" :class="{ open: isMenuOpen }">
        <li>
          <NuxtLinkLocale to="/" :class="{ active: isActive('/') }" @click="isMenuOpen = false">{{ $t('nav.home') }}</NuxtLinkLocale>
        </li>
        <li>
          <NuxtLinkLocale to="/blog" :class="{ active: isActive('/blog') }" @click="isMenuOpen = false">{{ $t('nav.blog') }}</NuxtLinkLocale>
        </li>
        <li>
          <NuxtLinkLocale to="/projects" :class="{ active: isActive('/projects') }" @click="isMenuOpen = false">{{ $t('nav.projects') }}</NuxtLinkLocale>
        </li>
        <li>
          <NuxtLinkLocale to="/now" :class="{ active: isActive('/now') }" @click="isMenuOpen = false">{{ $t('nav.now') }}</NuxtLinkLocale>
        </li>
        <li>
          <NuxtLinkLocale to="/changelog" :class="{ active: isActive('/changelog') }" @click="isMenuOpen = false">{{ $t('nav.changelog') }}</NuxtLinkLocale>
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

        <!-- Mobile Menu Button -->
        <button class="mobile-menu-btn" @click="isMenuOpen = !isMenuOpen" :title="isMenuOpen ? 'Close menu' : 'Open menu'">
          <svg v-if="!isMenuOpen" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="3" y1="6" x2="21" y2="6"></line>
            <line x1="3" y1="12" x2="21" y2="12"></line>
            <line x1="3" y1="18" x2="21" y2="18"></line>
          </svg>
          <svg v-else xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
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
const isMenuOpen = ref(false)

// Close menu when route changes
watch(() => route.path, () => {
  isMenuOpen.value = false
})

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
