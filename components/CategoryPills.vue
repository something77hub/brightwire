<template>
  <div class="relative z-40 bg-white/50 backdrop-blur-sm border-b border-amber-100/50">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 py-3">
      <div class="relative">
        <!-- Mobile: horizontal scroll -->
        <div class="flex items-center gap-2 sm:gap-3 overflow-x-auto lg:overflow-visible lg:flex-wrap pb-1 scrollbar-hide">
          <!-- If on homepage, use buttons for filtering -->
          <template v-if="isHomepage">
            <button
              v-for="cat in categories"
              :key="cat.id"
              @click="$emit('select', cat.id)"
              :class="[
                'flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all duration-300 flex-shrink-0',
                modelValue === cat.id
                  ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-lg shadow-amber-500/25 scale-105'
                  : 'bg-white/80 text-amber-800 hover:bg-white hover:shadow-md hover:scale-102'
              ]"
            >
              <span class="text-base">{{ cat.emoji }}</span>
              <span>{{ cat.label }}</span>
            </button>
          </template>
          <!-- On other pages, use links for navigation -->
          <template v-else>
            <NuxtLink
              v-for="cat in categories"
              :key="cat.id"
              :to="getCategoryLink(cat.id)"
              :class="[
                'flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all duration-300 flex-shrink-0',
                isActive(cat.id)
                  ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-lg shadow-amber-500/25 scale-105'
                  : 'bg-white/80 text-amber-800 hover:bg-white hover:shadow-md hover:scale-102'
              ]"
            >
              <span class="text-base">{{ cat.emoji }}</span>
              <span>{{ cat.label }}</span>
            </NuxtLink>
          </template>
        </div>
        <!-- Fade indicator on right (mobile only) -->
        <div class="absolute right-0 top-0 bottom-1 w-12 bg-gradient-to-l from-white/80 to-transparent pointer-events-none lg:hidden"></div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { CategoryInfo } from '~/types'

const props = defineProps<{
  modelValue?: string
}>()

defineEmits<{
  select: [category: string]
}>()

const route = useRoute()

// Check if we're on homepage (filtering mode) or other pages (navigation mode)
const isHomepage = computed(() => route.path === '/')

const categories: CategoryInfo[] = [
  { id: 'all', label: 'All Stories', emoji: '✨', color: 'amber' },
  { id: 'good-news', label: "Today's Good News", emoji: '☀️', color: 'amber' },
  { id: 'heroes', label: 'Community Heroes', emoji: '🦸', color: 'rose' },
  { id: 'planet', label: 'Planet Wins', emoji: '🌍', color: 'emerald' },
  { id: 'innovation', label: 'Innovation', emoji: '🚀', color: 'violet' },
  { id: 'solutions', label: 'Solutions', emoji: '💡', color: 'blue' },
  { id: 'kindness', label: 'Acts of Kindness', emoji: '💛', color: 'yellow' },
  { id: 'sports', label: 'Sports', emoji: '🏆', color: 'orange' },
]

function getCategoryLink(id: string): string {
  if (id === 'all') return '/'
  if (id === 'good-news') return '/today'
  return `/category/${id}`
}

function isActive(id: string): boolean {
  const path = route.path
  if (id === 'all' && path === '/') return true
  if (id === 'good-news' && path === '/today') return true
  if (path === `/category/${id}`) return true
  return false
}
</script>
