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
              <h1 class="text-xl font-bold text-gray-900">Video Generator</h1>
              <p class="text-xs text-gray-500">Create AI videos with HeyGen</p>
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
              <div class="relative mb-4">
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
              
              <!-- Article List -->
              <div class="max-h-64 overflow-y-auto space-y-2">
                <div v-if="loadingArticles" class="py-8 text-center text-gray-500">
                  Loading...
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
              </div>
              
              <!-- Quick actions -->
              <div v-if="selectedArticles.length > 0" class="mt-4 pt-4 border-t border-gray-100">
                <button
                  @click="selectedArticles = []"
                  class="text-xs text-gray-500 hover:text-gray-700"
                >
                  Clear selection
                </button>
              </div>
            </div>
          </div>

          <!-- Script Editor -->
          <div class="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div class="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
              <h2 class="font-semibold text-gray-900">2. Generate Script</h2>
              <span class="text-xs text-gray-500">{{ script.length }}/2500 chars</span>
            </div>
            <div class="p-6">
              <!-- Script Style Selection -->
              <div class="mb-4">
                <label class="block text-sm font-medium text-gray-700 mb-2">Script Style</label>
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
              </div>
              
              <!-- Generate Button -->
              <button
                @click="generateScript"
                :disabled="selectedArticles.length === 0"
                class="w-full mb-4 py-2 px-4 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                ✨ Generate {{ selectedStyle }} Script
              </button>
              
              <textarea
                v-model="script"
                rows="10"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-purple-500 focus:border-purple-500"
                placeholder="Select articles and generate a script, or write your own..."
              ></textarea>
              
              <p class="text-xs text-gray-500 mt-3">
                💡 Tip: Select multiple articles for a news roundup video!
              </p>
            </div>
          </div>

          <!-- Avatar & Voice Selection -->
          <div class="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div class="px-6 py-4 border-b border-gray-200">
              <h2 class="font-semibold text-gray-900">3. Choose Avatar & Voice</h2>
            </div>
            <div class="p-6 space-y-4">
              <!-- Avatar Selection -->
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Avatar</label>
                <div v-if="loadingAvatars" class="text-sm text-gray-500">Loading avatars...</div>
                <div v-else-if="avatars.length === 0" class="text-sm text-red-500">
                  No avatars found. Check your HeyGen API key.
                </div>
                <div v-else class="grid grid-cols-3 gap-2 max-h-48 overflow-y-auto">
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
                      class="w-12 h-12 rounded-full mx-auto object-cover"
                    />
                    <div v-else class="w-12 h-12 rounded-full mx-auto bg-gray-200 flex items-center justify-center">
                      <span class="text-lg">🎭</span>
                    </div>
                    <p class="text-xs text-gray-700 mt-1 truncate">{{ avatar.avatar_name }}</p>
                  </button>
                </div>
                <p v-if="selectedAvatar" class="text-xs text-green-600 mt-2">
                  ✓ Selected: {{ selectedAvatar.avatar_name }}
                </p>
              </div>
              
              <!-- Voice Selection -->
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Voice</label>
                <div v-if="loadingVoices" class="text-sm text-gray-500">Loading voices...</div>
                <div v-else-if="voices.length === 0" class="text-sm text-gray-500">
                  Using default voice
                </div>
                <select
                  v-else
                  v-model="selectedVoiceId"
                  class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-purple-500 focus:border-purple-500"
                >
                  <option value="">Default Voice</option>
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
            :disabled="!script || generating || !selectedAvatar"
            class="w-full py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl font-semibold hover:from-purple-600 hover:to-pink-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            <svg v-if="generating" class="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <svg v-else class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"/>
            </svg>
            {{ generating ? 'Generating...' : (selectedAvatar ? 'Generate Video' : 'Select an Avatar') }}
          </button>
        </div>

        <!-- Right: Generated Videos -->
        <div class="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div class="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
            <h2 class="font-semibold text-gray-900">Generated Videos</h2>
            <button @click="loadVideos" class="text-purple-600 hover:text-purple-700 text-sm">
              Refresh
            </button>
          </div>
          
          <div class="divide-y divide-gray-100 max-h-[600px] overflow-y-auto">
            <div v-if="loadingVideos" class="p-8 text-center">
              <svg class="w-8 h-8 text-purple-500 mx-auto mb-3 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <p class="text-gray-500">Loading videos...</p>
            </div>
            
            <div v-else-if="videos.length === 0" class="p-8 text-center">
              <svg class="w-12 h-12 text-gray-300 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"/>
              </svg>
              <p class="text-gray-500">No videos generated yet</p>
            </div>
            
            <div
              v-for="video in videos"
              :key="video.videoId"
              class="p-4"
            >
              <div class="flex items-start gap-4">
                <!-- Thumbnail -->
                <div class="w-24 h-16 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                  <img
                    v-if="video.thumbnailUrl"
                    :src="video.thumbnailUrl"
                    class="w-full h-full object-cover"
                  />
                  <div v-else class="w-full h-full flex items-center justify-center text-gray-400">
                    <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"/>
                    </svg>
                  </div>
                </div>
                
                <!-- Info -->
                <div class="flex-1 min-w-0">
                  <h3 class="text-sm font-medium text-gray-900 line-clamp-1">{{ video.title || 'Untitled' }}</h3>
                  <p class="text-xs text-gray-500 mt-1">{{ formatDate(video.createdAt) }}</p>
                  
                  <!-- Status Badge -->
                  <div class="mt-2">
                    <span
                      class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium"
                      :class="{
                        'bg-yellow-100 text-yellow-700': video.status === 'processing',
                        'bg-green-100 text-green-700': video.status === 'completed',
                        'bg-red-100 text-red-700': video.status === 'failed',
                        'bg-gray-100 text-gray-700': !['processing', 'completed', 'failed'].includes(video.status),
                      }"
                    >
                      <span v-if="video.status === 'processing'" class="w-1.5 h-1.5 bg-yellow-500 rounded-full animate-pulse"></span>
                      {{ video.status }}
                    </span>
                    
                    <!-- Error message -->
                    <p v-if="video.status === 'failed' && video.errorMessage" class="text-xs text-red-600 mt-1">
                      {{ video.errorMessage }}
                    </p>
                  </div>
                </div>
                
                <!-- Actions -->
                <div class="flex flex-col gap-2">
                  <button
                    v-if="video.status === 'processing'"
                    @click="checkStatus(video.videoId)"
                    class="px-3 py-1 text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors"
                  >
                    Check Status
                  </button>
                  <a
                    v-if="video.videoUrl"
                    :href="video.videoUrl"
                    target="_blank"
                    class="px-3 py-1 text-xs bg-purple-100 hover:bg-purple-200 text-purple-700 rounded-lg transition-colors text-center"
                  >
                    Download
                  </a>
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

const searchQuery = ref('')
const articles = ref<any[]>([])
const loadingArticles = ref(false)
const selectedArticles = ref<any[]>([])
const selectedStyle = ref('engaging')
const script = ref('')
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

// Hook templates for variety
const hooks = [
  "You're not gonna believe this!",
  "Okay, this just made my day.",
  "Stop scrolling, you need to hear this.",
  "Finally some good news!",
  "This is the kind of story we need right now.",
  "Wait till you hear what just happened.",
  "I've got something amazing to share.",
  "This story literally gave me chills.",
]

const transitions = [
  "And here's the best part:",
  "But wait, it gets better:",
  "Now get this:",
  "What's really incredible is:",
  "The amazing thing is:",
]

const closings = [
  "Follow BrightWire for more stories like this!",
  "This is why I love sharing good news. See you tomorrow!",
  "Drop a comment if this made you smile!",
  "Share this with someone who needs to hear it!",
  "Follow for your daily dose of positivity!",
  "Hit follow so you don't miss tomorrow's good news!",
]

// Load articles
async function loadArticles() {
  loadingArticles.value = true
  try {
    const data = await $fetch('/api/stories', { query: { limit: 50 } })
    articles.value = data.stories
  } catch (e) {
    console.error('Failed to load articles:', e)
  } finally {
    loadingArticles.value = false
  }
}

// Filtered articles based on search
const filteredArticles = computed(() => {
  if (!searchQuery.value) return articles.value
  const query = searchQuery.value.toLowerCase()
  return articles.value.filter(a =>
    a.title.toLowerCase().includes(query) ||
    a.category?.toLowerCase().includes(query)
  )
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

// Random picker helper
function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]
}

// Generate script based on selected articles and style
function generateScript() {
  if (selectedArticles.value.length === 0) return
  
  const hook = pick(hooks)
  const transition = pick(transitions)
  const closing = pick(closings)
  
  if (selectedArticles.value.length === 1) {
    // Single article script
    const article = selectedArticles.value[0]
    
    switch (selectedStyle.value) {
      case 'quick':
        script.value = `${hook}\n\n${article.title}.\n\n${article.summary?.slice(0, 150) || ''}\n\n${closing}`
        break
        
      case 'engaging':
        script.value = `${hook}\n\n${article.title}.\n\n${article.summary || ''}\n\n${transition} This is exactly the kind of story that reminds us there's so much good happening in the world.\n\n${closing}`
        break
        
      case 'storyteller':
        script.value = `${hook}\n\nLet me tell you about something incredible that just happened.\n\n${article.title}.\n\n${article.summary || ''}\n\n${transition} Stories like this remind me why I started sharing good news in the first place. In a world full of negativity, it's moments like these that give us hope.\n\n${closing}`
        break
        
      case 'roundup':
        script.value = `${hook}\n\n${article.title}.\n\n${article.summary || ''}\n\nThat's your good news update for today. Make sure you're following BrightWire so you never miss a story that'll brighten your day.\n\n${closing}`
        break
    }
  } else {
    // Multiple articles - news roundup
    const articleScripts = selectedArticles.value.map((article, i) => {
      const num = i === 0 ? 'First up' : i === selectedArticles.value.length - 1 ? 'And finally' : 'Next'
      return `${num}: ${article.title}. ${article.summary?.slice(0, 100) || ''}`
    }).join('\n\n')
    
    switch (selectedStyle.value) {
      case 'quick':
        script.value = `${hook} Here's your quick good news roundup.\n\n${articleScripts}\n\n${closing}`
        break
        
      case 'engaging':
      case 'storyteller':
        script.value = `${hook}\n\nI've got ${selectedArticles.value.length} amazing stories to share with you today. Let's dive in!\n\n${articleScripts}\n\n${transition} These stories prove that there's so much good happening in the world, we just have to look for it.\n\n${closing}`
        break
        
      case 'roundup':
        script.value = `Welcome to your BrightWire news roundup! ${hook}\n\nToday I've got ${selectedArticles.value.length} stories that are going to make your day.\n\n${articleScripts}\n\nAnd that's your roundup! Remember, good news is happening all around us. Stay tuned for tomorrow's update.\n\n${closing}`
        break
    }
  }
}

// Generate video
async function generateVideo() {
  if (!script.value || generating.value || !selectedAvatar.value) return
  
  generating.value = true
  try {
    const title = selectedArticles.value.length === 1 
      ? selectedArticles.value[0].title 
      : `BrightWire Roundup: ${selectedArticles.value.length} Stories`
    
    const result = await $fetch('/api/admin/video/generate', {
      method: 'POST',
      body: {
        script: script.value,
        title,
        articleIds: selectedArticles.value.map(a => a._id),
        avatarId: selectedAvatar.value.avatar_id,
        voiceId: selectedVoiceId.value || undefined,
      }
    })
    
    alert(`✅ Video generation started! ID: ${result.videoId}\n\nCheck back in a few minutes for the result.`)
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
    if (e.data?.message?.includes('not configured')) {
      heygenConfigured.value = false
    }
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
