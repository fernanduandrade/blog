<template>
  <div class="lang-switcher" ref="switcherRef">
    <button class="lang-btn" @click="open = !open">
      <span>{{ currentLocale?.name }}</span>
      <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
        <path d="M2 3.5L5 6.5L8 3.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
    </button>

    <Transition name="dropdown">
      <div v-if="open" class="lang-dropdown">
        <button
          v-for="locale in locales"
          :key="locale.code"
          class="lang-option"
          :class="{ active: locale.code === currentLocale?.code }"
          @click="switchLocale(locale.code)"
        >
          <span class="lang-flag">{{ localeFlag(locale.code) }}</span>
          <span>{{ locale.name }}</span>
        </button>
      </div>
    </Transition>
  </div>
</template>

<script setup>
const { locale, locales, setLocale } = useI18n()
const switcherRef = ref(null)
const open = ref(false)

const currentLocale = computed(() =>
  locales.value.find(l => l.code === locale.value)
)

function localeFlag(code) {
  const flags = { pt: '🇧🇷', en: '🇺🇸', es: '🇪🇸' }
  return flags[code] || '🌐'
}

async function switchLocale(code) {
  await setLocale(code)
  open.value = false
}

// Close on outside click
onMounted(() => {
  document.addEventListener('click', (e) => {
    if (switcherRef.value && !switcherRef.value.contains(e.target)) {
      open.value = false
    }
  })
})
</script>

<style scoped>
.dropdown-enter-active,
.dropdown-leave-active {
  transition: opacity 0.15s ease, transform 0.15s ease;
}
.dropdown-enter-from,
.dropdown-leave-to {
  opacity: 0;
  transform: translateY(-4px);
}
</style>
