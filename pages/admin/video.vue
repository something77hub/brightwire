<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Header -->
    <header class="bg-white border-b border-gray-200 sticky top-0 z-40">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 py-4">
        <div class="flex items-center justify-between">
          <div class="flex items-center space-x-4">
            <NuxtLink to="/admin" class="text-gray-400 hover:text-gray-600">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"/>
              </svg>
            </NuxtLink>
            <div class="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
              <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"/>
              </svg>
            </div>
            <div>
              <h1 class="text-xl font-bold text-gray-900">Video 2.0 Generator</h1>
              <p class="text-xs text-gray-500">AI-Powered News Production</p>
            </div>
          </div>
          
          <div class="flex items-center gap-3">
            <span v-if="!heygenConfigured" class="px-3 py-1 bg-red-100 text-red-700 rounded-full text-xs font-medium">
              HeyGen not configured
            </span>
            <span v-else class="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium flex items-center gap-1">
              <span class="w-2 h-2 bg-green-500 rounded-full"></span>
              HeyGen Connected
            </span>
          </div>
        </div>
      </div>
    </header>

    <main class="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      <div class="grid lg:grid-cols-2 gap-8">
        <!-- Left: Create Video -->
        <div class="space-y-6">
          <!-- Article Selection -->
          <div class="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div class="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
              <h2 class="font-semibold text-gray-900">1. Select Articles</h2>
              <span v-if="selectedArticles.length > 0" class="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded-full">
                {{ selectedArticles.length }} selected
              </span>
            </div>
            <div class="p-6">
              <!-- Search -->
              <div class="flex gap-2 mb-4">
                <div class="relative flex-1">
                  <svg class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
                  </svg>
                  <input
                    v-model="searchQuery"
                    type="text"
                    placeholder="Search articles..."
                    class="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-purple-500 focus:border-purple-500"
                  />
                </div>
                <select 
                  v-model="selectedCategory"
                  class="w-40 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-purple-500 focus:border-purple-500"
                >
                  <option value="all">All Categories</option>
                  <option v-for="cat in CORE_CATEGORIES" :key="cat.id" :value="cat.id">
                    {{ cat.emoji }} {{ cat.label }}
                  </option>
                </select>
              </div>
              
              <!-- Article List -->
              <div class="max-h-96 overflow-y-auto space-y-2">
                <div v-if="loadingArticles" class="py-8 text-center text-gray-500">
                  Loading articles...
                </div>
                <div
                  v-for="article in filteredArticles"
                  :key="article._id"
                  @click="toggleArticle(article)"
                  class="p-3 rounded-lg border cursor-pointer transition-colors"
                  :class="isSelected(article) ? 'border-purple-500 bg-purple-50' : 'border-gray-200 hover:border-gray-300'"
                >
                  <div class="flex items-start gap-3">
                    <div class="pt-0.5">
                      <div
                        class="w-5 h-5 rounded border-2 flex items-center justify-center transition-colors"
                        :class="isSelected(article) ? 'bg-purple-500 border-purple-500' : 'border-gray-300'"
                      >
                        <svg v-if="isSelected(article)" class="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7"/>
                        </svg>
                      </div>
                    </div>
                    <div class="flex-1 min-w-0">
                      <h3 class="text-sm font-medium text-gray-900 line-clamp-1">{{ article.title }}</h3>
                      <p class="text-xs text-gray-500 mt-1">{{ article.category }} • {{ formatDate(article.publishedAt) }}</p>
                    </div>
                  </div>
                </div>
                
                <div v-if="!loadingArticles && filteredArticles.length === 0" class="py-8 text-center text-gray-500 text-sm">
                  No articles found matching your filters.
                </div>
              </div>
            </div>
          </div>

          <!-- Script Style Selection (No Editor) -->
          <div class="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div class="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
              <h2 class="font-semibold text-gray-900">2. Video Style</h2>
            </div>
            <div class="p-6">
              <div class="grid grid-cols-2 gap-2">
                <button
                  v-for="style in scriptStyles"
                  :key="style.id"
                  @click="selectedStyle = style.id"
                  class="p-3 text-left rounded-lg border transition-colors"
                  :class="selectedStyle === style.id ? 'border-purple-500 bg-purple-50' : 'border-gray-200 hover:border-gray-300'"
                >
                  <div class="text-lg mb-1">{{ style.emoji }}</div>
                  <div class="text-xs font-medium text-gray-900">{{ style.name }}</div>
                  <div class="text-xs text-gray-500">{{ style.duration }}</div>
                </button>
              </div>
              
              <div class="mt-4 bg-purple-50 border border-purple-100 rounded-lg p-3 text-xs text-purple-700">
                <span class="font-semibold">🤖 AI Magic:</span> The script will be automatically written by our best AI news anchor agent, perfectly timed to your selected articles.
              </div>
            </div>
          </div>

          <!-- Avatar & Voice Selection -->
          <div class="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div class="px-6 py-4 border-b border-gray-200">
              <h2 class="font-semibold text-gray-900">3. Anchor</h2>
            </div>
            <div class="p-6 space-y-4">
              <!-- Avatar Selection -->
              <div>
                <div v-if="loadingAvatars" class="text-sm text-gray-500">Loading avatars...</div>
                <div v-else-if="avatars.length === 0" class="text-sm text-red-500">
                  No avatars found. Check API key.
                </div>
                <div v-else class="grid grid-cols-4 gap-2 max-h-48 overflow-y-auto">
                  <button
                    v-for="avatar in avatars"
                    :key="avatar.avatar_id"
                    @click="selectedAvatar = avatar"
                    class="p-2 rounded-lg border transition-all text-center"
                    :class="selectedAvatar?.avatar_id === avatar.avatar_id 
                      ? 'border-purple-500 bg-purple-50 ring-2 ring-purple-200' 
                      : 'border-gray-200 hover:border-gray-300'"
                  >
                    <img
                      v-if="avatar.preview_image_url"
                      :src="avatar.preview_image_url"
                      class="w-10 h-10 rounded-full mx-auto object-cover"
                    />
                  </button>
                </div>
                <p v-if="selectedAvatar" class="text-xs text-green-600 mt-2 font-medium">
                  {{ selectedAvatar.avatar_name }} selected
                </p>
              </div>
              
              <!-- Voice Selection -->
              <div>
                <select
                  v-model="selectedVoiceId"
                  class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-purple-500 focus:border-purple-500"
                >
                  <option value="">Default Voice (Recommended)</option>
                  <option v-for="voice in voices" :key="voice.voice_id" :value="voice.voice_id">
                    {{ voice.name }} ({{ voice.language }}, {{ voice.gender }})
                  </option>
                </select>
              </div>
            </div>
          </div>

          <!-- Generate Button -->
          <button
            @click="generateVideo"
            :disabled="selectedArticles.length === 0 || generating || !selectedAvatar"
            class="w-full py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-bold text-lg hover:shadow-lg hover:from-purple-700 hover:to-pink-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            <svg v-if="generating" class="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <span v-else>🚀 Generate Video 2.0</span>
          </button>
          
          <div v-if="generating" class="text-center text-sm text-purple-600 animate-pulse">
            Writing script and rendering scenes... This may take 30s.
          </div>
        </div>

        <!-- Right: Generated Videos -->
        <div class="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden h-fit">
          <div class="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
            <h2 class="font-semibold text-gray-900">Generated Videos</h2>
            <button @click="loadVideos" class="text-purple-600 hover:text-purple-700 text-sm">
              Refresh
            </button>
          </div>
          
          <div class="max-h-[80vh] overflow-y-auto p-4 space-y-4">
            <div v-if="videos.length === 0" class="text-center text-gray-500 py-10">
              No videos yet. Create one!
            </div>
            
            <div
              v-for="video in videos"
              :key="video.videoId"
              class="bg-gray-50 rounded-xl p-4 border border-gray-100"
            >
              <div class="flex items-start gap-4">
                <!-- Thumbnail -->
                <div class="w-20 h-32 bg-gray-200 rounded-lg overflow-hidden flex-shrink-0 relative group">
                  <img
                    v-if="video.thumbnailUrl"
                    :src="video.thumbnailUrl"
                    class="w-full h-full object-cover"
                  />
                  <div v-else class="w-full h-full flex items-center justify-center text-gray-400">
                    🎬
                  </div>
                  <a 
                    v-if="video.videoUrl"
                    :href="video.videoUrl" 
                    target="_blank"
                    class="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <svg class="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" /><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                  </a>
                </div>
                
                <!-- Info -->
                <div class="flex-1 min-w-0">
                  <h3 class="font-medium text-gray-900 line-clamp-2 leading-tight">{{ video.title || 'Untitled Video' }}</h3>
                  <div class="mt-2 flex flex-wrap gap-2">
                    <span 
                      class="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider"
                      :class="{
                        'bg-yellow-100 text-yellow-700': video.status === 'processing',
                        'bg-green-100 text-green-700': video.status === 'completed',
                        'bg-red-100 text-red-700': video.status === 'failed',
                      }"
                    >
                      {{ video.status }}
                    </span>
                    <span class="text-xs text-gray-500">{{ formatDate(video.createdAt) }}</span>
                  </div>
                  
                   <div class="mt-3 flex gap-2">
                    <button
                      v-if="video.status === 'processing'"
                      @click="checkStatus(video.videoId)"
                      class="text-xs bg-white border border-gray-200 px-3 py-1.5 rounded-lg hover:bg-gray-50"
                    >
                      Check Status
                    </button>
                    <a
                      v-if="video.videoUrl"
                      :href="video.videoUrl"
                      target="_blank"
                      class="text-xs bg-purple-600 text-white px-3 py-1.5 rounded-lg hover:bg-purple-700"
                    >
                      Download
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: false })
import { CORE_CATEGORIES } from '~/utils/constants'

const searchQuery = ref('')
const selectedCategory = ref('all')
const articles = ref<any[]>([])
const loadingArticles = ref(false)
const selectedArticles = ref<any[]>([])
const selectedStyle = ref('engaging')
const generating = ref(false)
const videos = ref<any[]>([])
const loadingVideos = ref(false)
const heygenConfigured = ref(true)

// Avatar & Voice selection
const avatars = ref<any[]>([])
const loadingAvatars = ref(false)
const selectedAvatar = ref<any>(null)
const voices = ref<any[]>([])
const loadingVoices = ref(false)
const selectedVoiceId = ref('')

// Load avatars on mount
async function loadAvatarsAndVoices() {
  loadingAvatars.value = true
  loadingVoices.value = true
  
  try {
    const [avatarData, voiceData] = await Promise.all([
      $fetch('/api/admin/video/avatars'),
      $fetch('/api/admin/video/voices').catch(() => ({ voices: [] }))
    ])
    
    avatars.value = avatarData.avatars || []
    voices.value = voiceData.voices || []
    
    // Auto-select first avatar if available
    if (avatars.value.length > 0 && !selectedAvatar.value) {
      selectedAvatar.value = avatars.value[0]
    }
  } catch (e: any) {
    console.error('Failed to load avatars/voices:', e)
    if (e.statusCode === 400) {
      heygenConfigured.value = false
    }
  } finally {
    loadingAvatars.value = false
    loadingVoices.value = false
  }
}

// Script style options
const scriptStyles = [
  { id: 'quick', name: 'Quick Update', duration: '~30 sec', emoji: '⚡' },
  { id: 'engaging', name: 'Engaging', duration: '~60 sec', emoji: '🎯' },
  { id: 'storyteller', name: 'Storyteller', duration: '~90 sec', emoji: '📖' },
  { id: 'roundup', name: 'News Roundup', duration: '~2 min', emoji: '📰' },
]

// Load articles
async function loadArticles() {
  loadingArticles.value = true
  try {
    const data = await $fetch('/api/admin/stories', { query: { limit: 1000 } })
    articles.value = data.stories
  } catch (e) {
    console.error('Failed to load articles:', e)
  } finally {
    loadingArticles.value = false
  }
}

// Filtered articles based on search and category
const filteredArticles = computed(() => {
  let result = articles.value
  
  if (selectedCategory.value !== 'all') {
    result = result.filter(a => a.category === selectedCategory.value)
  }
  
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    result = result.filter(a =>
      a.title.toLowerCase().includes(query) ||
      a.category?.toLowerCase().includes(query)
    )
  }
  
  return result
})

// Multi-select helpers
function isSelected(article: any) {
  return selectedArticles.value.some(a => a._id === article._id)
}

function toggleArticle(article: any) {
  if (isSelected(article)) {
    selectedArticles.value = selectedArticles.value.filter(a => a._id !== article._id)
  } else {
    selectedArticles.value.push(article)
  }
}

// Generate video
async function generateVideo() {
  if (generating.value || !selectedAvatar.value) return
  
  generating.value = true
  try {
    const title = selectedArticles.value.length === 1 
      ? selectedArticles.value[0].title 
      : `BrightWire Roundup: ${selectedArticles.value.length} Stories`
    
    const result = await $fetch('/api/admin/video/generate', {
      method: 'POST',
      body: {
        title,
        articleIds: selectedArticles.value.map(a => a._id),
        avatarId: selectedAvatar.value.avatar_id,
        voiceId: selectedVoiceId.value || undefined,
        style: selectedStyle.value
      }
    })
    
    alert(`✅ Video 2.0 generation started!\n\n${result.message}\nCheck the sidebar for status.`)
    loadVideos()
  } catch (e: any) {
    alert('❌ Failed to generate video: ' + (e.data?.message || e.message))
    
    if (e.data?.message?.includes('not configured')) {
      heygenConfigured.value = false
    }
  } finally {
    generating.value = false
  }
}

// Load generated videos
async function loadVideos() {
  loadingVideos.value = true
  try {
    const result = await $fetch('/api/admin/video')
    videos.value = result.videos
  } catch (e: any) {
    console.error('Failed to load videos:', e)
  } finally {
    loadingVideos.value = false
  }
}

// Check video status
async function checkStatus(videoId: string) {
  try {
    const result = await $fetch(`/api/admin/video/${videoId}`)
    
    // Update video in list
    const idx = videos.value.findIndex(v => v.videoId === videoId)
    if (idx !== -1) {
      videos.value[idx] = {
        ...videos.value[idx],
        status: result.status,
        videoUrl: result.videoUrl,
        thumbnailUrl: result.thumbnailUrl,
        errorMessage: result.error,
      }
    }
    
    if (result.status === 'completed') {
      alert('✅ Video is ready! You can download it now.')
    } else if (result.status === 'failed') {
      alert('❌ Video generation failed. Please try again.')
    } else {
      alert(`⏳ Video is still ${result.status}. Check back in a minute.`)
    }
  } catch (e: any) {
    alert('Failed to check status: ' + (e.data?.message || e.message))
  }
}

// Format date
function formatDate(date: string) {
  return new Date(date).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit'
  })
}

// On mount
onMounted(() => {
  loadArticles()
  loadVideos()
  loadAvatarsAndVoices()
})
</script>
