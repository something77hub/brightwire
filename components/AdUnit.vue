<template>
  <div v-if="ad" class="ad-unit" :class="containerClass">
    <a 
      :href="ad.linkUrl" 
      target="_blank" 
      rel="sponsored noopener"
      @click="trackClick"
      class="block"
    >
      <!-- Display Ad (Banner) -->
      <div v-if="ad.type === 'display'" :class="displayClass">
        <img 
          v-if="ad.imageUrl" 
          :src="ad.imageUrl" 
          :alt="ad.headline || 'Advertisement'"
          class="w-full h-full object-cover"
          loading="lazy"
        />
        <div v-else class="w-full h-full bg-gradient-to-r from-amber-100 to-orange-100 flex items-center justify-center p-4">
          <div class="text-center">
            <p v-if="ad.headline" class="font-semibold text-amber-900">{{ ad.headline }}</p>
            <p v-if="ad.description" class="text-sm text-amber-700/70 mt-1">{{ ad.description }}</p>
            <span class="inline-block mt-2 px-4 py-1 bg-amber-500 text-white text-sm rounded-full">
              {{ ad.ctaText || 'Learn More' }}
            </span>
          </div>
        </div>
        <span class="absolute top-1 right-1 text-[10px] text-gray-400 bg-white/80 px-1 rounded">Ad</span>
      </div>

      <!-- Sidebar/In-Feed Ad -->
      <div v-else-if="placement === 'sidebar' || placement === 'in-feed'" class="bg-white rounded-xl p-4 shadow-sm border border-amber-100 hover:shadow-md transition-shadow">
        <div class="flex items-center gap-1 text-[10px] text-gray-400 mb-2">
          <span>Sponsored</span>
        </div>
        <img 
          v-if="ad.imageUrl" 
          :src="ad.imageUrl" 
          :alt="ad.headline || 'Advertisement'"
          class="w-full h-32 object-cover rounded-lg mb-3"
          loading="lazy"
        />
        <p v-if="ad.headline" class="font-semibold text-amber-900 text-sm">{{ ad.headline }}</p>
        <p v-if="ad.description" class="text-xs text-amber-700/70 mt-1 line-clamp-2">{{ ad.description }}</p>
        <div class="flex items-center justify-between mt-3">
          <span class="text-xs text-gray-400">{{ ad.advertiser }}</span>
          <span class="text-xs text-amber-600 font-medium">{{ ad.ctaText || 'Learn More' }} →</span>
        </div>
      </div>

      <!-- Newsletter Ad -->
      <div v-else-if="placement === 'newsletter'" class="bg-amber-50 border border-amber-200 rounded-lg p-4">
        <div class="flex items-center gap-1 text-[10px] text-amber-600 mb-2">
          <span>📢 From our sponsor</span>
        </div>
        <div class="flex gap-4">
          <img 
            v-if="ad.imageUrl" 
            :src="ad.imageUrl" 
            :alt="ad.headline || 'Advertisement'"
            class="w-20 h-20 object-cover rounded-lg flex-shrink-0"
            loading="lazy"
          />
          <div>
            <p v-if="ad.headline" class="font-semibold text-amber-900">{{ ad.headline }}</p>
            <p v-if="ad.description" class="text-sm text-amber-700/70 mt-1">{{ ad.description }}</p>
            <span class="inline-block mt-2 text-amber-600 text-sm font-medium">{{ ad.ctaText || 'Learn More' }} →</span>
          </div>
        </div>
      </div>

      <!-- Default/Fallback -->
      <div v-else class="bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl p-4 border border-amber-100">
        <span class="text-[10px] text-gray-400">Sponsored</span>
        <p v-if="ad.headline" class="font-semibold text-amber-900 mt-1">{{ ad.headline }}</p>
        <p v-if="ad.description" class="text-sm text-amber-700/70 mt-1">{{ ad.description }}</p>
      </div>
    </a>
  </div>
</template>

<script setup lang="ts">
import type { Advertisement, AdPlacement } from '~/types'

const props = defineProps<{
  placement: AdPlacement
  category?: string
}>()

const ad = ref<Advertisement | null>(null)
const tracked = ref(false)

// Fetch ad client-side only to avoid SSR hydration issues
onMounted(async () => {
  try {
    const data = await $fetch('/api/ads', {
      query: { 
        placement: props.placement,
        category: props.category,
      },
    })
    
    if (data?.ads?.[0]) {
      ad.value = data.ads[0] as Advertisement
      
      // Track impression once
      if (!tracked.value && ad.value._id) {
        tracked.value = true
        $fetch('/api/ads/track', {
          method: 'POST',
          body: { adId: ad.value._id, action: 'impression' },
        }).catch(() => {}) // Silent fail
      }
    }
  } catch (e) {
    // Silent fail - no ads is fine
  }
})

// Track click
function trackClick() {
  if (ad.value?._id) {
    $fetch('/api/ads/track', {
      method: 'POST',
      body: { adId: ad.value._id, action: 'click' },
    }).catch(() => {}) // Silent fail
  }
}

// Styling
const containerClass = computed(() => {
  return ''
})

const displayClass = computed(() => {
  if (props.placement === 'header') return 'relative w-full h-24 sm:h-32 rounded-xl overflow-hidden'
  if (props.placement === 'article-top') return 'relative w-full h-20 rounded-lg overflow-hidden'
  if (props.placement === 'article-bottom') return 'relative w-full h-24 rounded-lg overflow-hidden'
  return 'relative w-full h-32 rounded-xl overflow-hidden'
})
</script>
