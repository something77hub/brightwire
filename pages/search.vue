<template>
  <div>
    <Header />
    
    <main class="max-w-6xl mx-auto px-4 sm:px-6 py-8">
      <!-- Search Input -->
      <div class="max-w-2xl mx-auto mb-8">
        <div class="relative">
          <svg class="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            ref="searchInput"
            v-model="query"
            type="text"
            placeholder="Search good news..."
            class="w-full pl-12 pr-4 py-4 text-lg bg-white border-2 border-amber-200 rounded-2xl outline-none focus:border-amber-400 focus:ring-4 focus:ring-amber-100 transition-all"
            autofocus
          />
          <button 
            v-if="query"
            @click="query = ''"
            class="absolute right-4 top-1/2 -translate-y-1/2 p-1 hover:bg-amber-100 rounded-full transition-colors"
          >
            <svg class="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>

      <!-- Loading -->
      <div v-if="pending && query" class="text-center py-12">
        <div class="w-10 h-10 border-4 border-amber-200 border-t-amber-500 rounded-full animate-spin mx-auto"></div>
        <p class="mt-4 text-amber-700/70">Searching...</p>
      </div>

      <!-- No query -->
      <div v-else-if="!query" class="text-center py-16">
        <div class="w-20 h-20 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg class="w-10 h-10 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
        <h2 class="text-xl font-bold text-amber-950 mb-2">Search BrightWire</h2>
        <p class="text-amber-700/70">Find uplifting stories about heroes, innovations, and solutions</p>
      </div>

      <!-- No results -->
      <div v-else-if="results.length === 0 && !pending" class="text-center py-16">
        <div class="w-20 h-20 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <span class="text-4xl">😕</span>
        </div>
        <h2 class="text-xl font-bold text-amber-950 mb-2">No results found</h2>
        <p class="text-amber-700/70">We couldn't find any stories matching "{{ query }}"</p>
        <p class="text-amber-600 text-sm mt-4">Try different keywords or browse our categories</p>
      </div>

      <!-- Results -->
      <div v-else>
        <p class="text-amber-700/70 mb-6">{{ results.length }} result{{ results.length !== 1 ? 's' : '' }} for "{{ query }}"</p>
        
        <div class="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <NuxtLink
            v-for="story in results"
            :key="story._id"
            :to="`/article/${story.slug}`"
            class="group bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-all hover:-translate-y-1"
          >
            <div class="relative h-40 overflow-hidden">
              <img 
                v-if="story.imageUrl"
                :src="story.imageUrl"
                :alt="story.title"
                class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
              <div v-else class="w-full h-full bg-gradient-to-br from-amber-100 to-orange-100 flex items-center justify-center">
                <span class="text-4xl">{{ getCategoryEmoji(story.category) }}</span>
              </div>
              <div class="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent"></div>
              <span 
                class="absolute bottom-3 left-3 text-xs font-bold px-3 py-1.5 rounded-full text-white flex items-center gap-1.5"
                :class="categoryBadgeClass(story.category)"
              >
                <span>{{ getCategoryEmoji(story.category) }}</span>
                {{ formatCategory(story.category) }}
              </span>
            </div>
            <div class="p-4">
              <h3 class="font-bold text-amber-950 group-hover:text-amber-700 transition-colors line-clamp-2 mb-2">
                {{ story.title }}
              </h3>
              <p class="text-sm text-amber-700/60 line-clamp-2">{{ story.summary }}</p>
            </div>
          </NuxtLink>
        </div>
      </div>

      <!-- Sidebar Widgets -->
      <div class="max-w-2xl mx-auto mt-16 mb-12">
        <SidebarWidgets />
      </div>
    </main>

    <Footer />
  </div>
</template>

<script setup lang="ts">
import type { Story } from '~/types'

const route = useRoute()
const query = ref((route.query.q as string) || '')
const searchInput = ref<HTMLInputElement | null>(null)

// Search API with debounce
const debouncedQuery = ref(query.value)
let debounceTimer: ReturnType<typeof setTimeout>

watch(query, (val) => {
  clearTimeout(debounceTimer)
  debounceTimer = setTimeout(() => {
    debouncedQuery.value = val
  }, 300)
})

const { data, pending } = useFetch<{ stories: Story[] }>('/api/search', {
  query: computed(() => ({ q: debouncedQuery.value })),
  watch: [debouncedQuery],
})

const results = computed(() => data.value?.stories || [])

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

function categoryBadgeClass(category: string): string {
  const colors: Record<string, string> = {
    'good-news': 'bg-amber-500',
    'heroes': 'bg-rose-500',
    'planet': 'bg-emerald-500',
    'innovation': 'bg-violet-500',
    'solutions': 'bg-blue-500',
  }
  return colors[category] || 'bg-amber-500'
}

function formatCategory(category: string): string {
  const labels: Record<string, string> = {
    'good-news': 'Daily Mix',
    'heroes': 'Heroes',
    'planet': 'Planet',
    'innovation': 'Innovation',
    'solutions': 'Solutions',
  }
  return labels[category] || 'Good News'
}

useHead({
  title: query.value ? `Search: ${query.value} - BrightWire` : 'Search - BrightWire',
  meta: [
    { name: 'description', content: 'Search BrightWire for uplifting news stories' }
  ]
})
</script>
