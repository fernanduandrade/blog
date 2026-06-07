<template>
  <div class="layout">
    <AppNav />
    <main>
      <slot />
    </main>
    <AppFooter />
  </div>
</template>

<script setup>
const colorMode = useColorMode()

function applyLightTheme() {
  colorMode.preference = 'light'
  colorMode.value = 'light'

  if (process.client) {
    document.documentElement.classList.remove('dark')
    document.documentElement.classList.add('light')
    document.documentElement.style.colorScheme = 'light'
  }
}

watch(() => colorMode.value, () => {
  applyLightTheme()
}, { immediate: process.client })

onMounted(() => {
  applyLightTheme()
})
</script>

<style scoped>
.layout {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}
main {
  flex: 1;
}
</style>
