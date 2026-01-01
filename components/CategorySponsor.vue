<template>
  <div v-if="sponsor" class="bg-gradient-to-r from-amber-50 to-orange-50 border-b border-amber-100">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 py-2">
      <a 
        :href="sponsor.linkUrl"
        target="_blank"
        rel="sponsored noopener"
        @click="trackClick"
        class="flex items-center justify-center gap-2 text-sm text-amber-700 hover:text-amber-900 transition-colors"
      >
        <span>{{ sponsor.sponsorText || `${categoryLabel} brought to you by` }}</span>
        <span class="font-semibold">{{ sponsor.advertiser }}</span>
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
        </svg>
      </a>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Advertisement, StoryCategory } from '~/types'

const props = defineProps<{
  category: StoryCategory
}>()

// Category labels
const categoryLabels: Record<string, string> = {
  'good-news': "Today's Good News",
  'heroes': 'Community Heroes',
  'planet': 'Planet Wins',
  'innovation': 'Innovation',
  'solutions': 'Solutions',
}

const categoryLabel = computed(() => categoryLabels[props.category] || props.category)

const sponsor = ref<Advertisement | null>(null)
const tracked = ref(false)

// Fetch sponsor client-side
onMounted(async () => {
  try {
    const data = await $fetch('/api/ads', {
      query: { placement: 'category-header' },
    })
    
    // Find sponsor for this specific category
    const ads = data?.ads || []
    const found = ads.find((ad: Advertisement) => ad.sponsoredCategory === props.category)
    
    if (found) {
      sponsor.value = found
      
      // Track impression once
      if (!tracked.value && found._id) {
        tracked.value = true
        $fetch('/api/ads/track', {
          method: 'POST',
          body: { adId: found._id, action: 'impression' },
        }).catch(() => {})
      }
    }
  } catch (e) {
    // Silent fail - no sponsor is fine
  }
})

// Track click
function trackClick() {
  if (sponsor.value?._id) {
    $fetch('/api/ads/track', {
      method: 'POST',
      body: { adId: sponsor.value._id, action: 'click' },
    }).catch(() => {})
  }
}
</script>
