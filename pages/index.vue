<template>
  <div>
    <Header />
    
    <!-- New Stories Toast -->
    <Transition
      enter-active-class="transition ease-out duration-300"
      enter-from-class="transform -translate-y-full opacity-0"
      enter-to-class="transform translate-y-0 opacity-100"
      leave-active-class="transition ease-in duration-200"
      leave-from-class="transform translate-y-0 opacity-100"
      leave-to-class="transform -translate-y-full opacity-0"
    >
      <div 
        v-if="newStoriesCount > 0" 
        class="fixed top-20 left-1/2 -translate-x-1/2 z-50 bg-amber-500 text-white px-6 py-3 rounded-full shadow-lg flex items-center gap-3 cursor-pointer hover:bg-amber-600 transition-colors"
        @click="loadNewStories"
      >
        <span class="animate-pulse">●</span>
        <span class="font-medium">{{ newStoriesCount }} new {{ newStoriesCount === 1 ? 'story' : 'stories' }}</span>
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
        </svg>
      </div>
    </Transition>
    
    <!-- Breaking Good News Ticker -->
    <div class="bg-gradient-to-r from-amber-500 to-orange-500 text-white py-2 overflow-hidden">
      <div class="flex items-center max-w-7xl mx-auto px-4 sm:px-6">
        <div class="flex items-center gap-3 flex-shrink-0 mr-4">
          <span class="bg-white text-amber-600 px-3 py-1 rounded text-xs font-bold uppercase">
            Live
          </span>
        </div>
        <div class="overflow-hidden flex-1">
          <div v-if="tickerStories.length" class="animate-marquee whitespace-nowrap">
            <span v-for="story in tickerStories" :key="story._id" class="mx-8">
              {{ getCategoryEmoji(story.category) }} {{ story.title }}
            </span>
            <!-- Duplicate for seamless loop -->
            <span v-for="story in tickerStories" :key="story._id + '-dup'" class="mx-8">
              {{ getCategoryEmoji(story.category) }} {{ story.title }}
            </span>
          </div>
          <div v-else class="text-white/80">
            Loading good news...
          </div>
        </div>
      </div>
    </div>

    <CategoryPills v-model="activeCategory" @select="activeCategory = $event" />

    <main class="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
      <!-- Loading state -->
      <div v-if="pending" class="flex flex-col items-center justify-center py-20">
        <div class="w-12 h-12 border-4 border-amber-200 border-t-amber-500 rounded-full animate-spin"></div>
        <p class="mt-4 text-amber-700/60">Loading good news...</p>
      </div>

      <!-- Error state -->
      <div v-else-if="error" class="text-center py-20">
        <span class="text-5xl mb-4 block">😢</span>
        <h2 class="text-2xl font-bold text-amber-900 mb-2">Oops! Something went wrong</h2>
        <p class="text-amber-700/60 mb-6">We couldn't load the good news right now.</p>
        <button 
          @click="refresh()"
          class="bg-amber-500 text-white px-6 py-2 rounded-full font-medium hover:bg-amber-600 transition-colors"
        >
          Try Again
        </button>
      </div>

      <!-- Empty state - no stories yet -->
      <div v-else-if="showEmptyState" class="text-center py-20">
        <span class="text-5xl mb-4 block">🌅</span>
        <h2 class="text-2xl font-bold text-amber-900 mb-2">Good news is brewing...</h2>
        <p class="text-amber-700/60 mb-6">We're gathering uplifting stories. Check back soon!</p>
        <button 
          @click="refresh(); if (data?.stories) allStories = data.stories"
          class="bg-amber-500 text-white px-6 py-2 rounded-full font-medium hover:bg-amber-600 transition-colors"
        >
          Refresh
        </button>
      </div>

      <!-- Content - only show when we have stories -->
      <template v-else-if="featuredStory || stories.length > 0">
        <div class="grid lg:grid-cols-3 gap-6">
          <!-- Main Content (2 columns) -->
          <div class="lg:col-span-2 space-y-6">
            <!-- Featured Story -->
            <section v-if="featuredStory">
              <FeaturedStory :story="featuredStory" />
            </section>

            <!-- Section Header -->
            <div class="flex items-center gap-4 pt-4">
              <h2 class="text-xl font-bold text-amber-950 font-display">
                {{ activeCategory === 'all' ? 'Latest Stories' : formatCategoryTitle(activeCategory) }}
              </h2>
              <div class="flex-1 h-px bg-gradient-to-r from-amber-300 to-transparent"></div>
              <span class="text-amber-600/60 text-sm">{{ data?.pagination.total || 0 }} stories</span>
            </div>

            <!-- Empty state -->
            <div v-if="!stories.length" class="text-center py-16 bg-white/50 rounded-2xl">
              <span class="text-5xl mb-4 block">📰</span>
              <h3 class="text-xl font-bold text-amber-900 mb-2">No stories yet</h3>
              <p class="text-amber-700/60">Check back soon for more good news!</p>
            </div>

            <!-- Story Grid - CNN Style (mixed sizes) -->
            <div v-else class="grid sm:grid-cols-2 gap-5">
              <StoryCard 
                v-for="(story, index) in stories" 
                :key="story._id || story.guid"
                :story="story"
                :index="index"
                :class="{ 'sm:col-span-2': index === 0 || index === 5 }"
              />
            </div>

            <!-- Load More Button (BBC style - user controlled) -->
            <div 
              v-if="data?.pagination.hasMore && !pending" 
              class="pt-8 flex flex-col items-center gap-4"
            >
              <button
                @click="loadMore"
                :disabled="loadingMore"
                class="group flex items-center gap-3 px-8 py-3 bg-amber-500 hover:bg-amber-600 text-white font-semibold rounded-full shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                <span v-if="loadingMore" class="flex items-center gap-2">
                  <svg class="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Loading...
                </span>
                <span v-else class="flex items-center gap-2">
                  Load More Stories
                  <svg class="w-5 h-5 group-hover:translate-y-0.5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/>
                  </svg>
                </span>
              </button>
              <p class="text-amber-600/60 text-sm">
                Showing {{ stories.length + 1 }} of {{ data?.pagination.total }} stories
              </p>
            </div>
            
            <!-- End of stories message -->
            <div v-else-if="!data?.pagination.hasMore && stories.length > 0" class="pt-8 text-center">
              <p class="text-amber-600/50 text-sm">✨ You've seen all the stories!</p>
            </div>
          </div>

          <!-- Sidebar -->
          <aside class="space-y-6">
            <!-- Trending Topics -->
            <div class="bg-white rounded-2xl p-5 shadow-lg">
              <div class="flex items-center gap-2 mb-4">
                <svg class="w-5 h-5 text-rose-500" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z"/>
                </svg>
                <h3 class="font-bold text-amber-950">Trending Now</h3>
              </div>
              <div class="space-y-3">
                <button 
                  v-for="(topic, i) in displayTrendingTopics" 
                  :key="topic"
                  @click="openSearchWithQuery(topic)"
                  class="flex items-center gap-3 group w-full text-left"
                >
                  <span class="text-2xl font-bold text-amber-300 group-hover:text-amber-500 transition-colors">{{ i + 1 }}</span>
                  <span class="text-amber-800 group-hover:text-amber-600 transition-colors text-sm font-medium">{{ topic }}</span>
                </button>
              </div>
            </div>

            <!-- Categories Quick Links -->
            <div class="bg-white rounded-2xl p-5 shadow-lg">
              <h3 class="font-bold text-amber-950 mb-4">Explore Categories</h3>
              <div class="space-y-2">
                <NuxtLink 
                  v-for="cat in categories" 
                  :key="cat.id"
                  :to="cat.id === 'all' ? '/' : `/category/${cat.id}`"
                  class="flex items-center gap-3 p-2 rounded-lg hover:bg-amber-50 transition-colors"
                >
                  <span class="text-xl">{{ cat.emoji }}</span>
                  <span class="text-amber-800 text-sm font-medium">{{ cat.label }}</span>
                </NuxtLink>
              </div>
            </div>

            <!-- Newsletter Mini -->
            <div class="bg-gradient-to-br from-amber-500 to-orange-500 rounded-2xl p-5 text-white">
              <span class="text-3xl block mb-2">☀️</span>
              <h3 class="font-bold mb-2">{{ siteSettings?.newsletterTitle || 'Daily Good News' }}</h3>
              <p class="text-white/80 text-sm mb-4">{{ siteSettings?.newsletterSubtitle || 'Get positivity in your inbox every morning.' }}</p>
              <form v-if="!quickSubscribed" @submit.prevent="subscribeQuick" class="space-y-2">
                <input 
                  type="email" 
                  v-model="quickEmail"
                  required
                  :disabled="quickLoading"
                  placeholder="Your email"
                  class="w-full px-4 py-2 rounded-lg text-amber-900 placeholder-amber-400 text-sm focus:outline-none focus:ring-2 focus:ring-white/50 disabled:opacity-50"
                />
                <button 
                  type="submit"
                  :disabled="quickLoading"
                  class="w-full bg-amber-950 text-white py-2 rounded-lg font-semibold text-sm hover:bg-amber-900 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  <svg v-if="quickLoading" class="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  {{ quickLoading ? 'Subscribing...' : (siteSettings?.newsletterButtonText || 'Subscribe Free') }}
                </button>
              </form>
              <div v-else class="text-center py-2">
                <svg class="w-8 h-8 mx-auto mb-2 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
                </svg>
                <p class="text-sm font-medium">{{ quickSuccessMsg || "You're in! 🎉" }}</p>
              </div>
              <p v-if="quickError" class="text-red-200 text-xs mt-2">{{ quickError }}</p>
            </div>

            <!-- Sidebar Ad (Self-managed first, then GAM fallback) -->
            <ClientOnly>
              <UnifiedAd placement="sidebar" />
            </ClientOnly>

            <!-- RSS Feed -->
            <div class="bg-white rounded-2xl p-5 shadow-lg">
              <h3 class="font-bold text-amber-950 mb-4">Stay Connected</h3>
              <a 
                href="/feed.xml" 
                target="_blank"
                class="flex items-center gap-3 p-3 bg-amber-50 hover:bg-amber-100 rounded-lg transition-colors"
              >
                <div class="w-10 h-10 bg-amber-500 rounded-lg flex items-center justify-center">
                  <svg class="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M6.18 15.64a2.18 2.18 0 0 1 2.18 2.18C8.36 19 7.38 20 6.18 20C5 20 4 19 4 17.82a2.18 2.18 0 0 1 2.18-2.18M4 4.44A15.56 15.56 0 0 1 19.56 20h-2.83A12.73 12.73 0 0 0 4 7.27V4.44m0 5.66a9.9 9.9 0 0 1 9.9 9.9h-2.83A7.07 7.07 0 0 0 4 12.93V10.1Z"/>
                  </svg>
                </div>
                <div>
                  <p class="font-semibold text-amber-900 text-sm">RSS Feed</p>
                  <p class="text-amber-600 text-xs">Subscribe in your reader</p>
                </div>
              </a>
            </div>
          </aside>
        </div>

        <!-- Full Width Newsletter -->
        <div id="newsletter">
          <Newsletter />
        </div>
      </template>
    </main>

    <Footer />
  </div>
</template>

<script setup lang="ts">
import type { Story } from '~/types'

const activeCategory = ref('all')
const page = ref(1)
const loadingMore = ref(false)
const allStories = ref<Story[]>([])
const quickEmail = ref('')
const quickLoading = ref(false)
const quickSubscribed = ref(false)
const quickError = ref('')
const quickSuccessMsg = ref('')
const newStoriesCount = ref(0)
const latestStoryId = ref<string | null>(null)

// Get Pusher instance
const { $pusher } = useNuxtApp()

// Fetch stories - only include category in query if it's a real category
const { data, pending, error, refresh } = await useFetch('/api/stories', {
  query: computed(() => {
    const q: Record<string, any> = { page: 1, limit: 12 }
    if (activeCategory.value && activeCategory.value !== 'all') {
      q.category = activeCategory.value
    }
    return q
  }),
  watch: false,
  // Disable caching to always get fresh data
  getCachedData: () => null,
})

// Also watch for data changes (handles SSR hydration and refreshes)
watch(data, (newData) => {
  // Only update if this is fresh data (after a refresh or initial load)
  if (newData?.stories?.length) {
    // Don't overwrite if we already have stories and this isn't a fresh fetch
    if (allStories.value.length === 0 || page.value === 1) {
      allStories.value = newData.stories
      latestStoryId.value = newData.stories[0]?._id || null
    }
  }
}, { immediate: true })

// Pusher channel reference
let pusherChannel: any = null

onMounted(() => {
  // Initialize allStories if data is already available (SSR case)
  if (data.value?.stories?.length && allStories.value.length === 0) {
    allStories.value = data.value.stories
    latestStoryId.value = data.value.stories[0]?._id || null
  }
  
  // Subscribe to Pusher for real-time updates
  if ($pusher) {
    pusherChannel = $pusher.subscribe('brightwire')
    pusherChannel.bind('new-articles', (data: { count: number; articles: Array<{ title: string; category: string }> }) => {
      console.log('[Pusher] New articles:', data)
      // Only show notification if on "all" category
      if (activeCategory.value === 'all') {
        newStoriesCount.value = data.count
      }
    })
    console.log('[Pusher] Subscribed to brightwire channel')
  } else {
    console.log('[Pusher] Not configured, using polling fallback')
    // Fallback to polling if Pusher not configured
    const pollInterval = setInterval(checkForNewStories, 2 * 60 * 1000)
    onUnmounted(() => clearInterval(pollInterval))
  }
  
  // Handle scroll to newsletter from URL hash
  if (window.location.hash === '#newsletter') {
    scrollToNewsletter()
  }
})

onUnmounted(() => {
  if (pusherChannel) {
    pusherChannel.unbind_all()
    pusherChannel.unsubscribe()
  }
})

// Scroll to newsletter and focus input
function scrollToNewsletter() {
  nextTick(() => {
    const newsletterEl = document.getElementById('newsletter')
    if (newsletterEl) {
      newsletterEl.scrollIntoView({ behavior: 'smooth', block: 'center' })
      // Focus the email input after scroll
      setTimeout(() => {
        const emailInput = newsletterEl.querySelector('input[type="email"]') as HTMLInputElement
        if (emailInput) {
          emailInput.focus()
        }
      }, 500)
    }
  })
}

// Expose for global use
if (import.meta.client) {
  (window as any).scrollToNewsletter = scrollToNewsletter
}

// Ticker stories (latest 6)
const tickerStories = computed(() => {
  const storyList = allStories.value.length > 0 ? allStories.value : (data.value?.stories || [])
  return storyList.slice(0, 6)
})

// Fetch trending topics from actual article tags
const { data: trendingData } = await useFetch('/api/trending', {
  getCachedData: () => null,
})
const trendingTopics = computed(() => trendingData.value?.tags || [])

// Fallback topics if no trending tags
const fallbackTopics = ['Good News', 'Community Heroes', 'Planet Wins', 'Innovation', 'Solutions']
const displayTrendingTopics = computed(() => {
  return trendingTopics.value.length > 0 ? trendingTopics.value : fallbackTopics
})

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

// Handle category changes
watch(activeCategory, async () => {
  page.value = 1
  allStories.value = []
  newStoriesCount.value = 0
  await refresh()
  // Update allStories after refresh
  if (data.value?.stories) {
    allStories.value = data.value.stories
    latestStoryId.value = data.value.stories[0]?._id || null
  }
})

// Poll for new stories
async function checkForNewStories() {
  if (activeCategory.value !== 'all') return // Only poll on "all" category
  
  try {
    const response = await $fetch('/api/stories', {
      query: { page: 1, limit: 1 },
    })
    
    if (response?.stories?.length) {
      const newestId = response.stories[0]._id
      if (latestStoryId.value && newestId !== latestStoryId.value) {
        // Count new stories
        const countResponse = await $fetch('/api/stories', {
          query: { page: 1, limit: 20 },
        })
        
        if (countResponse?.stories) {
          const currentIds = new Set(allStories.value.map(s => s._id))
          const newOnes = countResponse.stories.filter(s => !currentIds.has(s._id))
          newStoriesCount.value = newOnes.length
        }
      }
    }
  } catch (e) {
    console.error('Poll error:', e)
  }
}

async function loadNewStories() {
  await refresh()
  if (data.value?.stories) {
    allStories.value = data.value.stories
    latestStoryId.value = data.value.stories[0]?._id || null
  }
  newStoriesCount.value = 0
  page.value = 1
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

// Computed
const featuredStory = computed(() => {
  const storyList = allStories.value.length > 0 ? allStories.value : (data.value?.stories || [])
  if (!storyList.length) return null
  // Always show the newest story (first in list) as featured
  return storyList[0]
})

const stories = computed(() => {
  const storyList = allStories.value.length > 0 ? allStories.value : (data.value?.stories || [])
  const featured = featuredStory.value
  if (!featured) return storyList
  return storyList.filter(s => s._id !== featured._id && s.guid !== featured.guid)
})

// Show empty state
const showEmptyState = computed(() => {
  const storyList = allStories.value.length > 0 ? allStories.value : (data.value?.stories || [])
  return !pending.value && storyList.length === 0
})

const categories = [
  { id: 'all', label: 'All Stories', emoji: '✨' },
  { id: 'good-news', label: 'Good News', emoji: '☀️' },
  { id: 'heroes', label: 'Community Heroes', emoji: '🦸' },
  { id: 'planet', label: 'Planet Wins', emoji: '🌍' },
  { id: 'innovation', label: 'Innovation', emoji: '🚀' },
  { id: 'solutions', label: 'Solutions', emoji: '💡' },
]

// Map display names to category slugs
const categoryMap: Record<string, string> = {
  'good news': 'good-news',
  'community heroes': 'heroes',
  'planet wins': 'planet',
  'innovation': 'innovation',
  'solutions': 'solutions',
}

function openSearchWithQuery(query: string) {
  // Check if this is a category label - navigate to category page instead
  const categorySlug = categoryMap[query.toLowerCase()]
  if (categorySlug) {
    navigateTo(`/category/${categorySlug}`)
    return
  }
  
  // Otherwise navigate to search page
  navigateTo(`/search?q=${encodeURIComponent(query)}`)
}

// Methods
async function loadMore() {
  if (loadingMore.value || !data.value?.pagination?.hasMore) return
  
  loadingMore.value = true
  page.value++
  
  try {
    const query: Record<string, any> = { page: page.value, limit: 12 }
    if (activeCategory.value && activeCategory.value !== 'all') {
      query.category = activeCategory.value
    }
    const response = await $fetch('/api/stories', { query })
    
    if (response?.stories && response.stories.length > 0) {
      // Deduplicate - only add stories not already in the list
      const existingIds = new Set(allStories.value.map(s => s._id || s.guid))
      const newStories = response.stories.filter(s => !existingIds.has(s._id) && !existingIds.has(s.guid))
      
      if (newStories.length > 0) {
        allStories.value = [...allStories.value, ...newStories]
      }
      
      // Update pagination info
      if (data.value) {
        data.value.pagination = response.pagination
      }
    }
  } catch (e) {
    console.error('Failed to load more:', e)
    page.value--
  } finally {
    loadingMore.value = false
  }
}

async function subscribeQuick() {
  if (!quickEmail.value) return
  
  quickLoading.value = true
  quickError.value = ''
  
  try {
    const response = await $fetch('/api/subscribe', {
      method: 'POST',
      body: { email: quickEmail.value },
    })
    
    quickSuccessMsg.value = response.message || siteSettings.value?.newsletterSuccessMessage || "You're in! 🎉"
    quickSubscribed.value = true
    quickEmail.value = ''
  } catch (error: any) {
    quickError.value = error.data?.message || 'Something went wrong'
    setTimeout(() => {
      quickError.value = ''
    }, 5000)
  } finally {
    quickLoading.value = false
  }
}

function formatCategoryTitle(category: string): string {
  const titles: Record<string, string> = {
    solutions: 'Solutions & Progress',
    heroes: 'Community Heroes',
    planet: 'Planet Wins',
    innovation: 'Innovation & Discovery',
    'good-news': "Today's Good News",
    kindness: 'Acts of Kindness',
  }
  return titles[category] || 'Good News'
}

// SEO - Get site URL from database settings
const { siteUrl, siteSettings } = await useSiteSettings()
const ogImageUrl = computed(() => `${siteUrl.value}/api/og.png?type=home`)

useHead({
  title: 'BrightWire - Good News Daily | Positive News & Uplifting Stories',
  meta: [
    { name: 'description', content: 'Your daily dose of positive news. Discover uplifting stories about heroes, innovations, planet wins, and solutions that make the world a better place.' },
    { property: 'og:url', content: siteUrl },
    { property: 'og:image', content: ogImageUrl },
    { property: 'og:image:width', content: '1200' },
    { property: 'og:image:height', content: '630' },
    { name: 'twitter:image', content: ogImageUrl },
  ],
  link: [
    { rel: 'canonical', href: siteUrl },
  ],
  script: computed(() => [
    {
      type: 'application/ld+json',
      innerHTML: JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'WebSite',
        'name': 'BrightWire',
        'description': 'Your daily dose of positive news. Uplifting stories about heroes, innovations, planet wins, and solutions.',
        'url': siteUrl.value,
        'inLanguage': 'en-US',
        'potentialAction': {
          '@type': 'SearchAction',
          'target': {
            '@type': 'EntryPoint',
            'urlTemplate': `${siteUrl.value}/search?q={search_term_string}`,
          },
          'query-input': 'required name=search_term_string',
        },
      }),
    },
    {
      type: 'application/ld+json',
      innerHTML: JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'Organization',
        'name': 'BrightWire',
        'url': siteUrl.value,
        'logo': {
          '@type': 'ImageObject',
          'url': `${siteUrl.value}/api/logo.png`,
          'width': 600,
          'height': 60,
        },
        'description': 'Good news daily - positive journalism that inspires.',
        'sameAs': [], // Add social media URLs here if available
      }),
    },
  ]),
})
</script>

<style>
@keyframes marquee {
  0% { transform: translateX(0); }
  100% { transform: translateX(-50%); }
}

.animate-marquee {
  animation: marquee 30s linear infinite;
  display: inline-block;
}
</style>
