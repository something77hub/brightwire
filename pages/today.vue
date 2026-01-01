<template>
  <div>
    <Header />
    <CategoryPills />

    <main class="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
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
          <span class="font-medium">{{ newStoriesCount }} new {{ newStoriesCount === 1 ? 'story' : 'stories' }} available</span>
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
        </div>
      </Transition>

      <!-- Header -->
      <div class="mb-10 text-center">
        <span class="text-6xl mb-4 block">📰</span>
        <h1 class="text-3xl sm:text-4xl font-bold text-amber-950 mb-3 font-display">
          Today's Good News
        </h1>
        <p class="text-amber-700/70 max-w-2xl mx-auto">
          The latest positive stories from the last 24-48 hours. Fresh updates throughout the day.
        </p>
        <p class="text-sm text-amber-500 mt-2">
          {{ formattedDate }}
        </p>
      </div>

      <!-- Loading -->
      <div v-if="pending" class="flex flex-col items-center justify-center py-20">
        <div class="w-12 h-12 border-4 border-amber-200 border-t-amber-500 rounded-full animate-spin"></div>
        <p class="mt-4 text-amber-700/60">Loading today's stories...</p>
      </div>

      <!-- No stories -->
      <div v-else-if="!stories.length" class="text-center py-20">
        <span class="text-6xl mb-4 block">🌅</span>
        <h2 class="text-xl font-bold text-amber-900 mb-2">New stories coming soon!</h2>
        <p class="text-amber-700/60">Check back later for today's good news.</p>
      </div>

      <!-- Stories Grid -->
      <div v-else class="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <StoryCard
          v-for="(story, index) in stories"
          :key="story._id"
          :story="story"
          :index="index"
          :show-summary="true"
        />
      </div>

      <!-- Load More Button -->
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
          Showing {{ stories.length }} of {{ data?.pagination.total }} stories
        </p>
      </div>

      <!-- End of stories -->
      <div v-if="!data?.pagination.hasMore && stories.length > 0" class="pt-8 text-center">
        <p class="text-amber-600/50 text-sm">✨ You've seen all of today's stories!</p>
      </div>
      
      <!-- Newsletter -->
      <div id="newsletter" class="mt-12">
        <Newsletter />
      </div>
    </main>

    <Footer />
  </div>
</template>

<script setup lang="ts">
import type { Story } from '~/types'

const page = ref(1)
const loadingMore = ref(false)
const allStories = ref<Story[]>([])
const newStoriesCount = ref(0)
const latestStoryId = ref<string | null>(null)

// Get Pusher instance
const { $pusher } = useNuxtApp()
let pusherChannel: any = null

const { data, pending, refresh } = await useFetch('/api/today', {
  query: { page: 1, limit: 12 },
  getCachedData: () => null,
})

// Track the latest story ID
watch(data, (newData) => {
  if (newData?.stories?.length && !latestStoryId.value) {
    latestStoryId.value = newData.stories[0]._id
  }
}, { immediate: true })

const stories = computed(() => {
  return allStories.value.length ? allStories.value : (data.value?.stories || [])
})

const formattedDate = computed(() => {
  return new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  })
})

// Fallback polling for new stories
async function checkForNewStories() {
  try {
    const response = await $fetch('/api/today', {
      query: { page: 1, limit: 1 },
    })
    
    if (response?.stories?.length) {
      const newestId = response.stories[0]._id
      if (latestStoryId.value && newestId !== latestStoryId.value) {
        // Count how many new stories
        const countResponse = await $fetch('/api/today', {
          query: { page: 1, limit: 20 },
        })
        
        if (countResponse?.stories) {
          const currentIds = new Set(stories.value.map(s => s._id))
          const newStories = countResponse.stories.filter(s => !currentIds.has(s._id))
          newStoriesCount.value = newStories.length
        }
      }
    }
  } catch (e) {
    console.error('Failed to check for new stories:', e)
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
  
  // Scroll to top
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

async function loadMore() {
  if (loadingMore.value || !data.value?.pagination.hasMore) return
  
  loadingMore.value = true
  page.value++
  
  try {
    const response = await $fetch('/api/today', {
      query: { page: page.value, limit: 12 },
    })
    
    if (response?.stories) {
      const existingIds = new Set(allStories.value.map(s => s._id))
      const newStories = response.stories.filter(s => !existingIds.has(s._id))
      allStories.value = [...(allStories.value.length ? allStories.value : data.value?.stories || []), ...newStories]
    }
  } catch (e) {
    console.error('Failed to load more:', e)
    page.value--
  } finally {
    loadingMore.value = false
  }
}

onMounted(() => {
  // Subscribe to Pusher for real-time updates
  if ($pusher) {
    pusherChannel = $pusher.subscribe('brightwire')
    pusherChannel.bind('new-articles', (data: { count: number }) => {
      console.log('[Pusher] New articles:', data)
      newStoriesCount.value = data.count
    })
    console.log('[Pusher] Subscribed to brightwire channel')
  } else {
    // Fallback to polling if Pusher not configured
    const pollInterval = setInterval(checkForNewStories, 2 * 60 * 1000)
    onUnmounted(() => clearInterval(pollInterval))
  }
})

onUnmounted(() => {
  if (pusherChannel) {
    pusherChannel.unbind_all()
    pusherChannel.unsubscribe()
  }
})

useHead({
  title: "Today's Good News - BrightWire",
  meta: [
    { name: 'description', content: "Today's latest positive news stories. Fresh good news updated throughout the day." }
  ]
})
</script>
