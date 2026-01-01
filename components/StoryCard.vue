<template>
  <NuxtLink 
    :to="`/article/${story.slug}`"
    class="group cursor-pointer animate-fade-in block"
    :style="{ animationDelay: `${index * 75}ms` }"
  >
    <div class="h-full bg-white rounded-2xl overflow-hidden shadow-lg shadow-amber-900/5 hover:shadow-xl hover:shadow-amber-900/10 transition-all duration-300 hover:-translate-y-1 flex flex-col">
      <!-- Image -->
      <div class="relative h-48 overflow-hidden flex-shrink-0">
        <img 
          v-if="story.imageUrl"
          :src="story.imageUrl"
          :alt="story.title"
          class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
          loading="lazy"
        />
        <div v-else class="w-full h-full bg-gradient-to-br flex items-center justify-center" :class="categoryBgGradient">
          <span class="text-5xl">{{ categoryEmoji }}</span>
        </div>
        <div class="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent"></div>
        
        <!-- Category badge -->
        <span 
          class="absolute bottom-3 left-3 text-xs font-bold px-3 py-1.5 rounded-full text-white shadow-lg flex items-center gap-1.5"
          :class="categoryBadgeClass"
        >
          <span>{{ categoryEmoji }}</span>
          {{ formatCategory(story.category) }}
        </span>

        <!-- Score indicator -->
        <div 
          v-if="story.score >= 85"
          class="absolute top-4 right-4 w-8 h-8 bg-white/90 backdrop-blur rounded-full flex items-center justify-center shadow-md"
          :title="`Positivity score: ${story.score}`"
        >
          <span class="text-sm">🔥</span>
        </div>

        <!-- Video indicator -->
        <div 
          v-if="story.videoEmbedUrl"
          class="absolute top-4 bg-red-500/90 backdrop-blur text-white px-2 py-1 rounded-lg flex items-center gap-1.5 shadow-md text-xs font-semibold"
          :class="story.score >= 85 ? 'right-14' : 'right-4'"
        >
          <svg class="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M8 5v14l11-7z"/>
          </svg>
          Video
        </div>
      </div>

      <!-- Content -->
      <div class="p-5 flex flex-col flex-grow">
        <!-- Title -->
        <h3 class="font-bold text-amber-950 mb-3 leading-snug group-hover:text-amber-700 transition-colors line-clamp-2 font-display text-lg flex-grow">
          {{ story.title }}
        </h3>

        <!-- Summary -->
        <p v-if="showSummary" class="text-amber-700/60 text-sm mb-4 line-clamp-2">
          {{ story.summary }}
        </p>

        <!-- Meta -->
        <div class="flex items-center justify-between text-sm mt-auto pt-3 border-t border-amber-100/50">
          <div class="flex items-center gap-2 text-amber-600/70">
            <span v-if="story.readTime" class="flex items-center gap-1">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {{ story.readTime }} min
            </span>
            <span class="w-1 h-1 bg-amber-300 rounded-full"></span>
            <span>{{ timeAgo }}</span>
          </div>
          
          <span class="text-amber-500 group-hover:text-amber-600 transition-colors flex items-center gap-1">
            Read
            <svg class="w-4 h-4 group-hover:translate-x-0.5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
            </svg>
          </span>
        </div>
      </div>
    </div>
  </NuxtLink>
</template>

<script setup lang="ts">
import type { Story } from '~/types'

const props = withDefaults(defineProps<{
  story: Story
  index?: number
  showSummary?: boolean
}>(), {
  index: 0,
  showSummary: false,
})

const categoryEmojis: Record<string, string> = {
  'good-news': '✨',
  'heroes': '🦸',
  'planet': '🌍',
  'innovation': '🚀',
  'solutions': '💡',
    'kindness': '💛',
  'sports': '🏆',
}

const categoryBadgeColors: Record<string, string> = {
  'good-news': 'bg-amber-500',
  'heroes': 'bg-rose-500',
  'planet': 'bg-emerald-500',
  'innovation': 'bg-violet-500',
  'solutions': 'bg-blue-500',
  'kindness': 'bg-yellow-500',
  'sports': 'bg-orange-500',
}

const categoryBgGradients: Record<string, string> = {
  'good-news': 'from-amber-100 to-orange-100',
  'heroes': 'from-rose-100 to-pink-100',
  'planet': 'from-emerald-100 to-teal-100',
  'innovation': 'from-violet-100 to-purple-100',
  'solutions': 'from-blue-100 to-indigo-100',
  'kindness': 'from-yellow-100 to-amber-100',
  'sports': 'from-orange-100 to-red-100',
}

const categoryEmoji = computed(() => categoryEmojis[props.story.category] || '✨')
const categoryBadgeClass = computed(() => categoryBadgeColors[props.story.category] || 'bg-amber-500')
const categoryBgGradient = computed(() => categoryBgGradients[props.story.category] || 'from-amber-100 to-orange-100')

const timeAgo = computed(() => {
  // Use createdAt (when we added it) for the display time, fallback to publishedAt
  const dateStr = props.story.createdAt || props.story.publishedAt
  if (!dateStr) return ''
  const date = new Date(dateStr)
  const now = new Date()
  const diff = now.getTime() - date.getTime()
  
  // Future date handling (prevent 'Just now' for significant timezone skew)
  if (diff < 0) {
    // If it's more than 1 hour in the future, just show the date
    if (diff < -1000 * 60 * 60) {
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    }
    // Otherwise it's likely just minor clock skew, assume fresh
    return 'Just now'
  }
  
  const minutes = Math.floor(diff / (1000 * 60))
  const hours = Math.floor(minutes / 60)
  const days = Math.floor(hours / 24)
  
  if (minutes < 1) return 'Just now'
  if (minutes < 60) return `${minutes}m ago`
  if (hours < 24) return `${hours}h ago`
  if (days < 7) return `${days}d ago`
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
})

function formatCategory(category: string): string {
  const labels: Record<string, string> = {
    'good-news': 'Good News',
    'heroes': 'Heroes',
    'planet': 'Planet',
    'innovation': 'Innovation',
    'solutions': 'Solutions',
    'kindness': 'Kindness',
    'sports': 'Sports',
  }
  return labels[category] || 'Good News'
}
</script>
