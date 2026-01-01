<template>
  <div>
    <Header />
    <CategoryPills v-model="category" @select="navigateToCategory" />
    
    <CategoryPills v-model="category" @select="navigateToCategory" />
    
    <!-- Category Sponsor -->
    <CategorySponsor :category="category" />

    <main class="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
      <!-- Category Header -->
      <div class="mb-10 text-center">
        <span class="text-6xl mb-4 block">{{ categoryInfo.emoji }}</span>
        <h1 class="text-3xl sm:text-4xl font-bold text-amber-950 mb-3 font-display">
          {{ categoryInfo.title }}
        </h1>
        <p class="text-amber-700/70 max-w-2xl mx-auto">
          {{ categoryInfo.description }}
        </p>
      </div>

      <!-- Loading -->
      <div v-if="pending" class="flex flex-col items-center justify-center py-20">
        <div class="w-12 h-12 border-4 border-amber-200 border-t-amber-500 rounded-full animate-spin"></div>
        <p class="mt-4 text-amber-700/60">Loading stories...</p>
      </div>

      <!-- Error -->
      <div v-else-if="error" class="text-center py-20">
        <span class="text-5xl mb-4 block">😢</span>
        <h2 class="text-2xl font-bold text-amber-900 mb-2">Something went wrong</h2>
        <p class="text-amber-700/60 mb-6">We couldn't load the stories.</p>
        <button 
          @click="refresh()"
          class="bg-amber-500 text-white px-6 py-2 rounded-full font-medium hover:bg-amber-600 transition-colors"
        >
          Try Again
        </button>
      </div>

      <!-- Stories -->
      <template v-else>
        <!-- Empty -->
        <div v-if="!stories.length" class="text-center py-16 bg-white/50 rounded-2xl">
          <span class="text-5xl mb-4 block">📰</span>
          <h3 class="text-xl font-bold text-amber-900 mb-2">No stories yet</h3>
          <p class="text-amber-700/60 mb-6">Check back soon for more {{ categoryInfo.title.toLowerCase() }}!</p>
          <NuxtLink to="/" class="text-amber-600 hover:text-amber-700 font-medium">
            ← Back to all stories
          </NuxtLink>
        </div>

        <!-- Grid -->
        <div v-else>
          <div class="flex items-center justify-between mb-6">
            <span class="text-amber-600/60 text-sm">
              {{ data?.pagination?.total || stories.length }} stories
            </span>
          </div>

          <div class="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <StoryCard 
              v-for="(story, index) in stories" 
              :key="story._id || story.guid"
              :story="story"
              :index="index"
              :show-summary="true"
            />
          </div>

          <!-- Load More Button -->
          <div 
            v-if="data?.pagination?.hasMore"
            class="mt-10 flex flex-col items-center gap-4"
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
              Showing {{ stories.length }} of {{ data?.pagination?.total }} stories
            </p>
          </div>

          <!-- End of stories -->
          <div v-if="!data?.pagination?.hasMore && stories.length > 0" class="mt-10 text-center">
            <p class="text-amber-600/50 text-sm">✨ You've reached the end!</p>
          </div>
        </div>

        <div id="newsletter">
          <Newsletter />
        </div>
      </template>
    </main>

    <Footer />
  </div>
</template>

<script setup lang="ts">
const route = useRoute()
const router = useRouter()

// Category from route params
const category = computed(() => route.params.slug as string)
const page = ref(1)
const loadingMore = ref(false)
const allStories = ref<any[]>([])



const categoryData: Record<string, { title: string; emoji: string; description: string }> = {
  'good-news': {
    title: "Today's Good News",
    emoji: '☀️',
    description: 'Feel-good stories, heartwarming moments, and uplifting news from around the world.',
  },
  heroes: {
    title: 'Community Heroes',
    emoji: '🦸',
    description: 'Celebrating individuals making a difference—volunteers, activists, everyday heroes, and community leaders.',
  },
  planet: {
    title: 'Planet Wins',
    emoji: '🌍',
    description: 'Environmental victories, wildlife recovery, climate progress, conservation success, and sustainability wins.',
  },
  innovation: {
    title: 'Innovation & Discovery',
    emoji: '🚀',
    description: 'Scientific breakthroughs, medical advances, tech innovations, and discoveries improving our world.',
  },
  solutions: {
    title: 'Solutions That Work',
    emoji: '💡',
    description: 'Systemic fixes, effective policies, social programs, and initiatives making real impact.',
  },
  kindness: {
    title: 'Acts of Kindness',
    emoji: '💛',
    description: 'Heartwarming human moments, random acts of kindness, generosity, and compassion in action.',
  },
}

const categoryInfo = computed(() => categoryData[category.value] || {
  title: 'Good News',
  emoji: '✨',
  description: 'Uplifting stories from around the world.',
})

// Fetch stories - client-side only to guarantee route params are available
const data = ref<any>(null)
const pending = ref(true)
const error = ref<any>(null)

async function fetchStories() {
  const slug = route.params.slug as string
  if (!slug) return
  
  pending.value = true
  try {
    const response = await $fetch(`/api/category/${slug}`, {
      query: { page: 1, limit: 12 },
    })
    data.value = response
    error.value = null
  } catch (e) {
    error.value = e
  } finally {
    pending.value = false
  }
}

async function refresh() {
  await fetchStories()
}

// Fetch on mount and when category changes
onMounted(() => {
  fetchStories()
})

watch(() => route.params.slug, () => {
  page.value = 1
  allStories.value = []
  fetchStories()
})

// Computed stories list
const stories = computed(() => {
  return allStories.value.length > 0 ? allStories.value : (data.value?.stories || [])
})

function navigateToCategory(slug: string) {
  if (slug === 'all') {
    router.push('/')
  } else {
    router.push(`/category/${slug}`)
  }
}

async function loadMore() {
  if (loadingMore.value || !data.value?.pagination?.hasMore) return
  
  loadingMore.value = true
  page.value++
  
  try {
    const response = await $fetch(`/api/category/${route.params.slug}`, {
      query: {
        page: page.value,
        limit: 12,
      },
    })
    
    if (response?.stories) {
      const currentStories = allStories.value.length > 0 ? allStories.value : (data.value?.stories || [])
      const existingIds = new Set(currentStories.map((s: any) => s._id))
      const newStories = response.stories.filter((s: any) => !existingIds.has(s._id))
      allStories.value = [...currentStories, ...newStories]
    }
  } catch (e) {
    console.error('Failed to load more:', e)
    page.value--
  } finally {
    loadingMore.value = false
  }
}

// SEO - Get site URL from database settings
const { siteUrl } = await useSiteSettings()
const categoryUrl = computed(() => `${siteUrl.value}/category/${category.value}`)
const ogImageUrl = computed(() => `${siteUrl.value}/api/og.png?type=category&category=${category.value}`)

useHead({
  title: computed(() => `${categoryInfo.value.title} - BrightWire | Positive News`),
  meta: [
    { name: 'description', content: computed(() => categoryInfo.value.description) },
    { property: 'og:title', content: computed(() => `${categoryInfo.value.title} - BrightWire`) },
    { property: 'og:description', content: computed(() => categoryInfo.value.description) },
    { property: 'og:url', content: categoryUrl },
    { property: 'og:type', content: 'website' },
    { property: 'og:image', content: ogImageUrl },
    { property: 'og:image:width', content: '1200' },
    { property: 'og:image:height', content: '630' },
    { name: 'twitter:card', content: 'summary_large_image' },
    { name: 'twitter:title', content: computed(() => `${categoryInfo.value.title} - BrightWire`) },
    { name: 'twitter:description', content: computed(() => categoryInfo.value.description) },
    { name: 'twitter:image', content: ogImageUrl },
  ],
  link: [
    { rel: 'canonical', href: categoryUrl },
  ],
})
</script>
