<template>
  <footer class="footer">
    <div class="container footer-inner">
      <div class="footer-copy">
        <div>© {{ new Date().getFullYear() }} Fernando Andrade</div>
      </div>
      <div class="footer-links">
        <a href="https://github.com/fernanduandrade" target="_blank" rel="noopener" class="footer-link" title="GitHub">
          <IconGithub />
        </a>
        <a href="https://linkedin.com/in/fernanduandrade" target="_blank" rel="noopener" class="footer-link" title="LinkedIn">
          <IconLinkedin />
        </a>
        <a href="/feed.xml" class="footer-link" title="RSS">
          <IconRss />
        </a>
        <button class="footer-top" @click="scrollTop" :title="$t('footer.backToTop')">
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
            <path d="M6 9.5V2.5M6 2.5L2.5 6M6 2.5L9.5 6" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </button>
      </div>
    </div>
  </footer>
</template>

<script setup>
function scrollTop() {
  window.scrollTo({ top: 0, behavior: 'smooth' })
}
</script>
