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

// Apply color mode class to html element
watch(() => colorMode.value, (val) => {
  document.documentElement.className = val
}, { immediate: process.client })

onMounted(() => {
  document.documentElement.className = colorMode.value
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
