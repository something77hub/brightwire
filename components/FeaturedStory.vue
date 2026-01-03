<template>
  <NuxtLink v-if="story" :to="`/article/${story.slug}`" class="group cursor-pointer block">
    <div class="relative">
      <!-- Glow effect -->
      <div class="absolute inset-0 bg-gradient-to-r from-amber-400 to-rose-400 rounded-3xl blur-xl opacity-20 group-hover:opacity-30 transition-opacity duration-500"></div>
      
      <!-- Card -->
      <div class="relative bg-white rounded-3xl overflow-hidden shadow-xl shadow-amber-900/5 group-hover:shadow-2xl group-hover:shadow-amber-900/10 transition-all duration-500">
        <div class="grid lg:grid-cols-2 gap-0" :class="{ '!grid-cols-1': !hasValidImage }">
          <!-- Image -->
          <div v-if="hasValidImage" class="relative h-64 sm:h-72 lg:h-auto lg:min-h-[400px] overflow-hidden">
            <img 
              :src="story.imageUrl"
              :alt="story.title"
              class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
              loading="lazy"
              @error="imageError = true"
            />
            <div class="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent lg:bg-gradient-to-r lg:from-transparent lg:via-transparent lg:to-white/20"></div>
            
            <!-- Featured badge -->
            <span class="absolute top-5 left-5 bg-gradient-to-r from-emerald-400 to-teal-500 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg flex items-center gap-1.5">
              <svg class="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
              Featured Story
            </span>

            <!-- Video badge -->
            <span 
              v-if="story.videoEmbedUrl"
              class="absolute top-5 right-5 bg-red-500/90 backdrop-blur text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg flex items-center gap-1.5"
            >
              <svg class="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z"/>
              </svg>
              Video
            </span>
          </div>

          <!-- Content -->
          <div class="p-6 sm:p-8 lg:p-10 flex flex-col justify-center">
            <!-- Category -->
            <div class="flex items-center gap-3 mb-4">
              <span class="w-10 h-0.5 bg-gradient-to-r from-emerald-400 to-teal-400 rounded-full"></span>
              <span :class="categoryColorClass" class="font-semibold text-sm">
                {{ formatCategory(story.category) }}
              </span>
            </div>

            <!-- Title -->
            <h2 class="text-2xl sm:text-3xl lg:text-4xl font-bold text-amber-950 mb-4 leading-tight group-hover:text-amber-700 transition-colors font-display">
              {{ story.title }}
            </h2>

            <!-- Summary -->
            <p class="text-amber-800/70 mb-6 leading-relaxed line-clamp-3 text-base sm:text-lg">
              {{ story.summary }}
            </p>

            <!-- Meta -->
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-3">
                <div class="w-10 h-10 bg-gradient-to-br from-amber-300 to-orange-400 rounded-full flex items-center justify-center text-white font-bold shadow-md text-sm">
                  {{ authorInitials }}
                </div>
                <div>
                  <p class="text-amber-900 font-medium text-sm">{{ story.author }}</p>
                  <p class="text-amber-600/60 text-xs">{{ story.readTime || 3 }} min read · {{ timeAgo }}</p>
                </div>
              </div>
              
              <span class="flex items-center gap-2 text-amber-600 group-hover:text-amber-700 font-medium text-sm">
                Read Story
                <svg class="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </NuxtLink>
</template>

<script setup lang="ts">
import type { Story } from '~/types'

const props = defineProps<{
  story: Story | null
}>()

const imageError = ref(false)
const hasValidImage = computed(() => props.story?.imageUrl && !imageError.value)

const categoryEmojis: Record<string, string> = {
  'good-news': '✨',
  'heroes': '🦸',
  'planet': '🌍',
  'innovation': '🚀',
  'solutions': '💡',
  'kindness': '💛',
}

const categoryColors: Record<string, string> = {
  'good-news': 'text-amber-600',
  'heroes': 'text-rose-600',
  'planet': 'text-emerald-600',
  'innovation': 'text-violet-600',
  'solutions': 'text-blue-600',
  'kindness': 'text-yellow-600',
}

const categoryEmoji = computed(() => 
  props.story ? categoryEmojis[props.story.category] || '✨' : '✨'
)

const categoryColorClass = computed(() =>
  props.story ? categoryColors[props.story.category] || 'text-amber-600' : 'text-amber-600'
)

const authorInitials = computed(() => {
  if (!props.story?.author) return 'BW'
  const names = props.story.author.trim().split(' ')
  if (names.length >= 2) {
    return (names[0][0] + names[names.length - 1][0]).toUpperCase()
  }
  return names[0].substring(0, 2).toUpperCase()
})

const timeAgo = computed(() => {
  if (!props.story) return ''
  const date = new Date(props.story.publishedAt)
  const now = new Date()
  const diff = now.getTime() - date.getTime()
  const hours = Math.floor(diff / (1000 * 60 * 60))
  const days = Math.floor(hours / 24)
  
  if (hours < 1) return 'Just now'
  if (hours < 24) return `${hours} hour${hours > 1 ? 's' : ''} ago`
  if (days < 7) return `${days} day${days > 1 ? 's' : ''} ago`
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
})

function formatCategory(category: string): string {
  const labels: Record<string, string> = {
    'good-news': 'Daily Mix',
    'heroes': 'Community Heroes',
    'planet': 'Planet Wins',
    'innovation': 'Innovation',
    'solutions': 'Solutions',
  }
  return labels[category] || 'Good News'
}
</script>
