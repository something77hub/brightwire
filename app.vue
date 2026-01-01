<template>
  <div class="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-rose-50">
    <!-- Decorative background blobs -->
    <div class="fixed inset-0 overflow-hidden pointer-events-none -z-10">
      <div class="absolute -top-40 -right-40 w-[500px] h-[500px] bg-gradient-to-br from-amber-200/40 to-orange-300/30 rounded-full blur-3xl"></div>
      <div class="absolute top-1/3 -left-40 w-[400px] h-[400px] bg-gradient-to-br from-rose-200/30 to-pink-300/20 rounded-full blur-3xl"></div>
      <div class="absolute bottom-20 right-1/4 w-[350px] h-[350px] bg-gradient-to-br from-teal-200/25 to-cyan-300/20 rounded-full blur-3xl"></div>
      <div class="absolute bottom-1/3 left-1/3 w-[300px] h-[300px] bg-gradient-to-br from-yellow-200/20 to-amber-300/15 rounded-full blur-3xl"></div>
    </div>

    <NuxtPage />
  </div>
</template>

<script setup lang="ts">
// Global app setup
</script>

<style>
/* Global styles */
html {
  scroll-behavior: smooth;
}

/* Custom scrollbar */
::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

::-webkit-scrollbar-track {
  background: transparent;
}

::-webkit-scrollbar-thumb {
  background: rgb(251 191 36 / 0.3);
  border-radius: 4px;
}

::-webkit-scrollbar-thumb:hover {
  background: rgb(251 191 36 / 0.5);
}

/* Hide scrollbar for category pills */
.scrollbar-hide {
  -ms-overflow-style: none;
  scrollbar-width: none;
}

.scrollbar-hide::-webkit-scrollbar {
  display: none;
}

/* Line clamp utilities */
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.line-clamp-3 {
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

/* Hide CookieYes revisit consent button after user accepts */
.cky-revisit-bottom-left,
.cky-revisit-bottom-right,
.cky-btn-revisit-wrapper {
  display: none !important;
}
</style>
