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

    <!-- Global New Articles Banner -->
    <Transition
      enter-active-class="transform ease-out duration-300 transition"
      enter-from-class="translate-y-2 opacity-0 sm:translate-y-0 sm:translate-x-2"
      enter-to-class="translate-y-0 opacity-100 sm:translate-x-0"
      leave-active-class="transition ease-in duration-100"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div v-if="showNewArticlesBanner" class="fixed bottom-4 right-4 z-50 max-w-md w-full bg-white shadow-lg rounded-lg pointer-events-auto flex ring-1 ring-black ring-opacity-5">
        <div class="flex-1 w-0 p-4">
          <div class="flex items-start">
            <div class="flex-shrink-0 pt-0.5">
              <span class="text-2xl">✨</span>
            </div>
            <div class="ml-3 flex-1">
              <p class="text-sm font-medium text-gray-900">
                New Good News!
              </p>
              <p class="mt-1 text-sm text-gray-500">
                {{ newArticlesCount }} new positive stor{{ newArticlesCount === 1 ? 'y' : 'ies' }} just arrived.
              </p>
              <div class="mt-3 flex space-x-7">
                <button @click="refreshPage" class="bg-white rounded-md text-sm font-medium text-amber-600 hover:text-amber-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500">
                  Update now
                </button>
                <button @click="dismissBanner" class="bg-white rounded-md text-sm font-medium text-gray-700 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500">
                  Dismiss
                </button>
              </div>
            </div>
          </div>
        </div>
        <div class="flex border-l border-gray-200">
          <button @click="dismissBanner" class="w-full border border-transparent rounded-none rounded-r-lg p-4 flex items-center justify-center text-sm font-medium text-gray-600 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-amber-500">
            <svg class="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
              <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd" />
            </svg>
          </button>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
// Global app setup
const { showNewArticlesBanner, newArticlesCount, dismissBanner, subscribe } = usePusherUpdates()

// Subscribe globally
onMounted(() => {
  subscribe()
})

const router = useRouter()
const refreshPage = () => {
    dismissBanner()
    // Initial refresh logic - reload page to fetch fresh data through cache
    window.location.reload()
}
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
