<template>
  <!-- Multiple Self-managed Ads -->
  <div v-if="selfManagedAds.length > 0" class="ad-unit-container" :class="containerClass">
    <div v-for="(ad, index) in selfManagedAds" :key="ad._id" class="ad-unit" :class="{ 'mt-4': index > 0 }">
      <a 
        :href="ad.linkUrl" 
        target="_blank" 
        rel="sponsored noopener"
        @click="() => trackClick(ad._id)"
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

        <!-- Default/Fallback -->
        <div v-else class="bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl p-4 border border-amber-100">
          <span class="text-[10px] text-gray-400">Sponsored</span>
          <p v-if="ad.headline" class="font-semibold text-amber-900 mt-1">{{ ad.headline }}</p>
          <p v-if="ad.description" class="text-sm text-amber-700/70 mt-1">{{ ad.description }}</p>
        </div>
      </a>
    </div>
  </div>
  
  <!-- GAM Ads (fallback when no self-managed ads) -->
  <!-- Shows multiple GAM slots if count > 1 -->
  <div v-else-if="useGam && fetchAttempted" class="gam-fallback-container" :class="containerClass">
    <GamAdSlot
      v-for="i in gamSlotCount"
      :key="`gam-${placement}-${i}`"
      :placement="gamPlacement"
      :container-class="i > 1 ? 'mt-4' : ''"
      :show-label="showLabel"
    />
  </div>
</template>

<script setup lang="ts">
import type { Advertisement, AdPlacement } from '~/types'

const props = withDefaults(defineProps<{
  placement: AdPlacement
  category?: string
  count?: number           // How many ads to show (1-5)
  containerClass?: string
  showLabel?: boolean
}>(), {
  count: 1,
  showLabel: true,
})

const config = useRuntimeConfig()

// Check if GAM is enabled
const useGam = computed(() => !!config.public.gamNetworkCode)

// How many GAM slots to show as fallback
const gamSlotCount = computed(() => Math.min(Math.max(props.count, 1), 3)) // Max 3 GAM slots

// Map placement names to GAM ad unit names
const gamPlacement = computed(() => {
  const mapping: Record<string, string> = {
    'sidebar': 'sidebar',
    'header': 'header_banner',
    'article-top': 'article_top',
    'article-bottom': 'article_bottom',
    'in-feed': 'in_feed',
    'category-header': 'category_header',
  }
  return mapping[props.placement] || props.placement
})

// Self-managed ads state (array now)
const selfManagedAds = ref<Advertisement[]>([])
const trackedIds = ref<Set<string>>(new Set())
const fetchAttempted = ref(false)

// Try to fetch self-managed ads first
onMounted(async () => {
  try {
    const data = await $fetch('/api/ads', {
      query: { 
        placement: props.placement,
        category: props.category,
        count: props.count,
      },
    })
    
    if (data?.ads?.length > 0) {
      selfManagedAds.value = data.ads as Advertisement[]
      
      // Track impressions for all ads
      for (const ad of selfManagedAds.value) {
        if (ad._id && !trackedIds.value.has(ad._id)) {
          trackedIds.value.add(ad._id)
          $fetch('/api/ads/track', {
            method: 'POST',
            body: { adId: ad._id, action: 'impression' },
          }).catch(() => {})
        }
      }
    }
  } catch (e) {
    // Silent fail
  } finally {
    fetchAttempted.value = true
  }
})

// Track click
function trackClick(adId: string) {
  if (adId) {
    $fetch('/api/ads/track', {
      method: 'POST',
      body: { adId, action: 'click' },
    }).catch(() => {})
  }
}

// Display styling
const displayClass = computed(() => {
  if (props.placement === 'header') return 'relative w-full h-24 sm:h-32 rounded-xl overflow-hidden'
  if (props.placement === 'article-top') return 'relative w-full h-20 rounded-lg overflow-hidden'
  if (props.placement === 'article-bottom') return 'relative w-full h-24 rounded-lg overflow-hidden'
  return 'relative w-full h-32 rounded-xl overflow-hidden'
})
</script>
