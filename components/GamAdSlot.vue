<template>
  <div 
    v-if="enabled"
    class="gam-ad-unit" 
    :class="containerClass"
  >
    <!-- Ad container -->
    <div :id="slotId" class="gam-slot" :style="minHeightStyle"></div>
    
    <!-- Ad label (optional) -->
    <span v-if="showLabel" class="text-[10px] text-gray-400 mt-1 block text-center">
      Advertisement
    </span>
  </div>
</template>

<script setup lang="ts">
const props = withDefaults(defineProps<{
  // Placement name (matches GAM ad unit) - e.g., "sidebar", "article_bottom"
  placement: string
  // Or custom ad unit path (overrides placement)
  adUnit?: string
  // Custom sizes (overrides placement defaults)
  sizes?: number[][]
  // Custom container class
  containerClass?: string
  // Show "Advertisement" label
  showLabel?: boolean
  // Lazy load this ad
  lazy?: boolean
}>(), {
  showLabel: true,
  lazy: true,
})

const config = useRuntimeConfig()
const { $gpt, $gamPlacements } = useNuxtApp()

// Check if GAM is enabled
const enabled = computed(() => !!config.public.gamNetworkCode && !!$gpt)

// Get placement config
const placementConfig = computed(() => {
  if ($gamPlacements && props.placement) {
    return $gamPlacements[props.placement]
  }
  return null
})

// Determine ad unit path
const adUnitPath = computed(() => {
  return props.adUnit || props.placement
})

// Determine sizes
const adSizes = computed(() => {
  if (props.sizes) return props.sizes
  if (placementConfig.value) return placementConfig.value.sizes
  return [[300, 250]]
})

// Min height to prevent layout shift
const minHeightStyle = computed(() => {
  const sizes = adSizes.value
  if (sizes && sizes.length > 0) {
    // Use smallest height to minimize reserved space
    const minHeight = Math.min(...sizes.map(s => s[1]))
    return { minHeight: `${minHeight}px` }
  }
  return { minHeight: '250px' }
})

// Generate unique slot ID
const slotId = ref(`gam-${props.placement}-${Math.random().toString(36).substring(7)}`)

// Track if slot is defined
const slotDefined = ref(false)

onMounted(() => {
  if (!enabled.value || !$gpt) return
  
  // Use Intersection Observer for lazy loading
  if (props.lazy) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting && !slotDefined.value) {
          defineAndDisplaySlot()
          observer.disconnect()
        }
      })
    }, {
      rootMargin: '200px' // Load when 200px away from viewport
    })
    
    const el = document.getElementById(slotId.value)
    if (el) observer.observe(el)
    
    onUnmounted(() => observer.disconnect())
  } else {
    defineAndDisplaySlot()
  }
})

function defineAndDisplaySlot() {
  if (slotDefined.value || !$gpt) return
  slotDefined.value = true
  
  // Use pre-configured placement if available
  if (placementConfig.value?.sizeMapping) {
    $gpt.defineResponsiveSlot(
      adUnitPath.value, 
      placementConfig.value.sizeMapping, 
      slotId.value
    )
  } else {
    $gpt.defineSlot(adUnitPath.value, adSizes.value, slotId.value)
  }
}

// Cleanup on unmount
onUnmounted(() => {
  if ($gpt && slotDefined.value) {
    $gpt.destroySlot(slotId.value)
  }
})
</script>

<style scoped>
.gam-ad-unit {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.gam-slot {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
}

/* Loading shimmer while ad loads */
.gam-slot:empty::before {
  content: '';
  display: block;
  width: 300px;
  height: 250px;
  max-width: 100%;
  background: linear-gradient(90deg, #f3f4f6 25%, #e5e7eb 50%, #f3f4f6 75%);
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
  border-radius: 8px;
}

@keyframes shimmer {
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}
</style>
