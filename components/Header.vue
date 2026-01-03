<template>
  <header class="relative z-50 border-b border-amber-200/50 bg-white/70 backdrop-blur-xl sticky top-0">
    <div class="max-w-7xl mx-auto px-4 sm:px-6">
      <!-- Top bar -->
      <div class="hidden sm:flex items-center justify-between py-2.5 border-b border-amber-100/50 text-sm">
        <div class="flex items-center gap-6 text-amber-800/60">
          <span class="flex items-center gap-2">
            <span class="relative flex h-2 w-2">
              <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span class="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span class="font-medium">Live Updates</span>
          </span>
          <!-- Streak Badge -->
          <button 
            v-if="streak > 0"
            @click="showStreakModal = true"
            class="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-orange-100 hover:bg-orange-200 transition-colors text-orange-700 cursor-pointer"
            title="Your Good Vibes Streak"
          >
            <span class="animate-pulse">🔥</span>
            <span class="font-bold">{{ streak }}</span>
            <span class="text-xs font-medium opacity-80">day streak</span>
          </button>
          <WeatherWidget />
          <span class="w-px h-4 bg-amber-200"></span>
          <span>{{ currentDateTime }}</span>
        </div>
        <div class="flex items-center gap-4">
          <button 
            @click="scrollToNewsletter"
            class="text-amber-700/70 hover:text-amber-900 transition-colors font-medium"
          >
            Subscribe
          </button>
          <button 
            @click="scrollToNewsletter"
            class="bg-gradient-to-r from-amber-500 to-orange-500 text-white px-5 py-1.5 rounded-full font-medium hover:shadow-lg hover:shadow-amber-500/25 hover:-translate-y-0.5 transition-all duration-300"
          >
            Join Newsletter
          </button>
        </div>
      </div>

      <!-- Main header -->
      <div class="flex items-center justify-between py-4 gap-4">
        <!-- Logo -->
        <NuxtLink to="/" class="flex items-center gap-3 group flex-shrink-0">
          <div class="relative">
            <div class="w-11 h-11 sm:w-12 sm:h-12 bg-gradient-to-br from-amber-400 via-orange-400 to-rose-400 rounded-2xl flex items-center justify-center shadow-lg shadow-amber-500/25 group-hover:shadow-amber-500/40 transition-shadow">
              <svg class="w-6 h-6 sm:w-7 sm:h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            </div>
            <div class="absolute -top-1 -right-1 w-3.5 h-3.5 bg-gradient-to-br from-yellow-300 to-amber-400 rounded-full animate-bounce shadow-sm"></div>
          </div>
          <div class="hidden sm:block">
            <h1 class="text-xl sm:text-2xl font-bold bg-gradient-to-r from-amber-600 via-orange-600 to-rose-600 bg-clip-text text-transparent font-display">
              BrightWire
            </h1>
            <p class="text-[10px] sm:text-xs text-amber-700/50 tracking-[0.2em] uppercase font-medium">Good News Daily</p>
          </div>
        </NuxtLink>

        <!-- Navigation - Hidden on mobile -->
        <nav class="hidden lg:flex items-center gap-3">
          <NuxtLink 
            v-for="item in navItems" 
            :key="item.href"
            :to="item.href"
            class="text-amber-900/70 hover:text-amber-600 transition-colors font-medium text-xs relative group"
          >
            {{ item.label }}
            <span class="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-amber-400 to-orange-400 group-hover:w-full transition-all duration-300"></span>
          </NuxtLink>
        </nav>

        <!-- Search Bar -->
        <div class="relative flex-1 max-w-md" ref="searchContainer">
          <div class="relative">
            <svg class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              v-model="searchQuery"
              type="text"
              placeholder="Search good news..."
              class="w-full pl-10 pr-4 py-2 text-xs bg-amber-50/50 border border-amber-200/50 rounded-full outline-none focus:bg-white focus:border-amber-300 focus:ring-2 focus:ring-amber-100 transition-all placeholder:text-amber-400"
              @focus="searchFocused = true"
              @keydown.escape="closeSearch"
            />
            <button 
              v-if="searchQuery"
              @click="searchQuery = ''; closeSearch()"
              class="absolute right-3 top-1/2 -translate-y-1/2 p-0.5 hover:bg-amber-200 rounded-full transition-colors"
            >
              <svg class="w-4 h-4 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <!-- Search Results Dropdown -->
          <Transition
            enter-active-class="transition duration-150 ease-out"
            enter-from-class="opacity-0 scale-95"
            enter-to-class="opacity-100 scale-100"
            leave-active-class="transition duration-100 ease-in"
            leave-from-class="opacity-100 scale-100"
            leave-to-class="opacity-0 scale-95"
          >
            <div 
              v-if="searchFocused && (searchQuery || searchPending)"
              class="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-xl border border-amber-100 overflow-hidden z-50"
            >
              <!-- Loading -->
              <div v-if="searchPending" class="p-4 text-center">
                <div class="w-5 h-5 border-2 border-amber-200 border-t-amber-500 rounded-full animate-spin mx-auto"></div>
                <p class="text-sm text-amber-600 mt-2">Searching...</p>
              </div>

              <!-- No results -->
              <div v-else-if="searchResults.length === 0 && searchQuery.length >= 2" class="p-4 text-center">
                <span class="text-2xl">😕</span>
                <p class="text-sm text-amber-700/70 mt-1">No results for "{{ searchQuery }}"</p>
              </div>

              <!-- Min chars -->
              <div v-else-if="searchQuery.length < 2" class="p-4 text-center">
                <p class="text-sm text-amber-600">Type at least 2 characters...</p>
              </div>

              <!-- Results -->
              <div v-else class="max-h-80 overflow-y-auto">
                <NuxtLink
                  v-for="story in searchResults.slice(0, 6)"
                  :key="story._id"
                  :to="`/article/${story.slug}`"
                  class="flex gap-3 p-3 hover:bg-amber-50 transition-colors border-b border-amber-50 last:border-0"
                  @click="closeSearch"
                >
                  <img 
                    v-if="story.imageUrl"
                    :src="story.imageUrl"
                    :alt="story.title"
                    class="w-12 h-12 object-cover rounded-lg flex-shrink-0"
                  />
                  <div class="w-12 h-12 bg-amber-100 rounded-lg flex items-center justify-center flex-shrink-0" v-else>
                    <span class="text-lg">{{ getCategoryEmoji(story.category) }}</span>
                  </div>
                  <div class="flex-1 min-w-0">
                    <h4 class="font-medium text-amber-950 text-sm line-clamp-1">{{ story.title }}</h4>
                    <p class="text-xs text-amber-600/70 line-clamp-1 mt-0.5">{{ story.summary }}</p>
                  </div>
                </NuxtLink>
                
                <!-- View all results -->
                <NuxtLink 
                  v-if="searchResults.length > 6"
                  :to="`/search?q=${encodeURIComponent(searchQuery)}`"
                  class="block p-3 text-center text-sm text-amber-600 hover:bg-amber-50 font-medium"
                  @click="closeSearch"
                >
                  View all {{ searchResults.length }} results →
                </NuxtLink>
              </div>
            </div>
          </Transition>
        </div>

        <!-- Mobile menu button -->
        <button 
          @click="mobileMenuOpen = !mobileMenuOpen"
          class="lg:hidden p-2.5 text-amber-700/60 hover:text-amber-900 hover:bg-amber-100/50 rounded-xl transition-all flex-shrink-0"
        >
          <svg v-if="!mobileMenuOpen" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
          <svg v-else class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <!-- Mobile menu -->
      <Transition
        enter-active-class="transition duration-200 ease-out"
        enter-from-class="opacity-0 -translate-y-2"
        enter-to-class="opacity-100 translate-y-0"
        leave-active-class="transition duration-150 ease-in"
        leave-from-class="opacity-100 translate-y-0"
        leave-to-class="opacity-0 -translate-y-2"
      >
        <div v-if="mobileMenuOpen" class="lg:hidden py-4 border-t border-amber-100/50">
          <nav class="flex flex-col gap-2">
            <NuxtLink 
              v-for="item in navItems" 
              :key="item.href"
              :to="item.href"
              class="text-amber-900/70 hover:text-amber-600 hover:bg-amber-50 transition-colors font-medium py-2 px-3 rounded-lg"
              @click="mobileMenuOpen = false"
            >
              {{ item.label }}
            </NuxtLink>
          </nav>
          <div class="mt-4 pt-4 border-t border-amber-100/50 flex gap-3">
            <button 
              @click="scrollToNewsletter(); mobileMenuOpen = false"
              class="flex-1 text-amber-700 border border-amber-200 px-4 py-2 rounded-full font-medium hover:bg-amber-50 transition-colors"
            >
              Subscribe
            </button>
            <button 
              @click="scrollToNewsletter(); mobileMenuOpen = false"
              class="flex-1 bg-gradient-to-r from-amber-500 to-orange-500 text-white px-4 py-2 rounded-full font-medium"
            >
              Newsletter
            </button>
          </div>
        </div>
      </Transition>
      <!-- Streak Modal -->
      <Teleport to="body">
        <div v-if="showStreakModal" class="fixed inset-0 bg-black/50 overflow-y-auto h-full w-full z-[100] flex items-center justify-center p-4" @click.self="showStreakModal = false">
          <div class="relative bg-white rounded-2xl shadow-2xl max-w-sm w-full p-6 text-center transform transition-all scale-100">
            <!-- Confetti/Decor -->
            <!-- Confetti/Decor -->
            <div class="absolute -top-12 left-1/2 -translate-x-1/2">
              <div class="text-6xl animate-bounce">
                🔥
              </div>
            </div>
            
            <h3 class="text-2xl font-bold text-amber-950 mt-4 mb-2 font-display">
              {{ streak }} Day Streak!
            </h3>
            
            <p class="text-amber-800/70 mb-6">
              You've visited BrightWire for {{ streak }} consecutive days. Keep the good vibes going!
            </p>
            
            <div class="bg-amber-50 rounded-xl p-4 mb-6 border border-amber-100">
              <p class="text-sm font-medium text-amber-900 mb-1">Current Status</p>
              <div class="flex justify-center gap-1 mb-2">
                <span v-for="i in Math.min(streak, 5)" :key="i" class="text-xl">🔥</span>
                <span v-if="streak > 5" class="text-sm self-center text-amber-500 font-bold ml-1">+{{ streak - 5 }}</span>
              </div>
              <p class="text-xs text-amber-600/60"> Come back tomorrow to keep it up!</p>
            </div>
            
            <div class="flex flex-col gap-3">
              <button 
                @click="shareStreak"
                class="w-full bg-black text-white font-medium py-3 px-4 rounded-xl hover:bg-gray-800 transition-colors flex items-center justify-center gap-2"
              >
                <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
                Share Streak
              </button>
              <button 
                @click="showStreakModal = false"
                class="w-full text-amber-700 font-medium py-2 hover:bg-amber-50 rounded-xl transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </Teleport>
    </div>
  </header>
</template>

<script setup lang="ts">
import type { Story } from '~/types'
import { CORE_CATEGORIES } from '~/utils/constants'

const mobileMenuOpen = ref(false)
const searchQuery = ref('')
const searchFocused = ref(false)
const searchContainer = ref<HTMLElement | null>(null)

const navItems = computed(() => [
  { label: 'All Stories', href: '/' },
  ...CORE_CATEGORIES.map(c => ({ 
    label: c.label, 
    href: `/category/${c.id}`
  })),
])

// Debounced search
const debouncedQuery = ref('')
let debounceTimer: ReturnType<typeof setTimeout>

watch(searchQuery, (val) => {
  clearTimeout(debounceTimer)
  debounceTimer = setTimeout(() => {
    debouncedQuery.value = val
  }, 300)
})

// Search API
const { data: searchData, pending: searchPending } = useFetch<{ stories: Story[] }>('/api/search', {
  query: computed(() => ({ q: debouncedQuery.value })),
  watch: [debouncedQuery],
  immediate: false,
})

const searchResults = computed(() => searchData.value?.stories || [])

function closeSearch() {
  searchFocused.value = false
}

function getCategoryEmoji(category: string): string {
  const emojis: Record<string, string> = {
    'good-news': '☀️',
    'heroes': '🦸',
    'planet': '🌍',
    'innovation': '🚀',
    'solutions': '💡',
  }
  return emojis[category] || '✨'
}

// Close search when clicking outside
function handleClickOutside(e: MouseEvent) {
  if (searchContainer.value && !searchContainer.value.contains(e.target as Node)) {
    closeSearch()
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})

// Scroll to newsletter section and focus email input
function scrollToNewsletter() {
  const newsletter = document.getElementById('newsletter')
  if (newsletter) {
    newsletter.scrollIntoView({ behavior: 'smooth', block: 'center' })
    // Focus the email input after scroll animation
    setTimeout(() => {
      const emailInput = newsletter.querySelector('input[type="email"]') as HTMLInputElement
      if (emailInput) {
        emailInput.focus()
      }
    }, 500)
  } else {
    // Navigate to home page with newsletter hash
    navigateTo('/#newsletter')
  }
}

const { streak, showStreakModal } = useStreak()

// Live clock
const currentDateTime = ref('')

function updateTime() {
  const now = new Date()
  currentDateTime.value = now.toLocaleString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  })
}

function shareStreak() {
  const text = `🔥 I'm on a ${streak.value}-day Good Vibes Streak on BrightWire! The world isn't all bad. ☀️`
  const url = window.location.origin
  window.open(
    `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`,
    '_blank'
  )
  showStreakModal.value = false
}

onMounted(() => {
  updateTime()
  setInterval(updateTime, 1000)
})
</script>
