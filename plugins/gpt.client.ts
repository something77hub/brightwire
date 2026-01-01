// Google Publisher Tag (GPT) Plugin for Google Ad Manager
// https://developers.google.com/publisher-tag/guides/get-started

declare global {
  interface Window {
    googletag: any
  }
}

// Standard IAB ad sizes
const IAB_SIZES = {
  // Rectangles
  mediumRectangle: [300, 250],
  largeRectangle: [336, 280],
  halfPage: [300, 600],
  
  // Leaderboards
  leaderboard: [728, 90],
  billboard: [970, 250],
  largeLeaderboard: [970, 90],
  mobileLeaderboard: [320, 50],
  mobileBanner: [320, 100],
  
  // Skyscrapers
  wideSkyscraper: [160, 600],
  skyscraper: [120, 600],
}

// Pre-configured ad placements for BrightWire
// These work with standard GAM setup - just create matching ad units
const DEFAULT_PLACEMENTS: Record<string, { 
  sizes: number[][], 
  sizeMapping?: { viewport: number[], sizes: number[][] }[] 
}> = {
  sidebar: {
    sizes: [[300, 250], [300, 600], [336, 280]],
    sizeMapping: [
      { viewport: [1024, 0], sizes: [[300, 250], [300, 600]] },
      { viewport: [768, 0], sizes: [[300, 250]] },
      { viewport: [0, 0], sizes: [] }, // Hide on mobile
    ]
  },
  header_banner: {
    sizes: [[970, 90], [970, 250], [728, 90], [320, 50]],
    sizeMapping: [
      { viewport: [1024, 0], sizes: [[970, 90], [970, 250]] },
      { viewport: [728, 0], sizes: [[728, 90]] },
      { viewport: [0, 0], sizes: [[320, 50]] },
    ]
  },
  article_top: {
    sizes: [[728, 90], [300, 250], [320, 50]],
    sizeMapping: [
      { viewport: [728, 0], sizes: [[728, 90]] },
      { viewport: [0, 0], sizes: [[300, 250], [320, 50]] },
    ]
  },
  article_bottom: {
    sizes: [[728, 90], [300, 250], [336, 280], [320, 50]],
    sizeMapping: [
      { viewport: [728, 0], sizes: [[728, 90], [300, 250]] },
      { viewport: [0, 0], sizes: [[300, 250], [320, 50]] },
    ]
  },
  in_feed: {
    sizes: [[300, 250], [336, 280]],
  },
  category_header: {
    sizes: [[728, 90], [320, 50]],
    sizeMapping: [
      { viewport: [728, 0], sizes: [[728, 90]] },
      { viewport: [0, 0], sizes: [[320, 50]] },
    ]
  },
}

export default defineNuxtPlugin((nuxtApp) => {
  const config = useRuntimeConfig()
  
  // Only run on client
  if (import.meta.server) return
  
  // Check if GAM is enabled
  const networkCode = config.public.gamNetworkCode
  if (!networkCode) {
    console.log('[GAM] No network code configured, skipping GPT initialization')
    return {
      provide: {
        gpt: null,
        gamPlacements: DEFAULT_PLACEMENTS,
      }
    }
  }
  
  // Initialize googletag command queue
  window.googletag = window.googletag || { cmd: [] }
  
  // Load GPT script
  const script = document.createElement('script')
  script.async = true
  script.src = 'https://securepubads.g.doubleclick.net/tag/js/gpt.js'
  document.head.appendChild(script)
  
  // Configure GPT once loaded
  window.googletag.cmd.push(() => {
    // Enable single request mode for better performance
    window.googletag.pubads().enableSingleRequest()
    
    // Collapse empty divs (no ad = no space)
    window.googletag.pubads().collapseEmptyDivs()
    
    // Enable lazy loading for ads below the fold
    window.googletag.pubads().enableLazyLoad({
      fetchMarginPercent: 200,  // Fetch ads 2 viewports away
      renderMarginPercent: 100, // Render ads 1 viewport away
      mobileScaling: 2.0        // Double margins on mobile
    })
    
    // Enable services
    window.googletag.enableServices()
    
    console.log('[GAM] Google Publisher Tag initialized with network:', networkCode)
  })
  
  // Provide helper functions
  return {
    provide: {
      gpt: {
        networkCode,
        
        // Get default placement config
        getPlacement(name: string) {
          return DEFAULT_PLACEMENTS[name] || DEFAULT_PLACEMENTS.sidebar
        },
        
        // Define and display an ad slot
        defineSlot(adUnitPath: string, size: number[] | number[][], divId: string) {
          window.googletag.cmd.push(() => {
            const fullPath = adUnitPath.startsWith('/') 
              ? adUnitPath 
              : `/${networkCode}/${adUnitPath}`
            
            const slot = window.googletag
              .defineSlot(fullPath, size, divId)
              ?.addService(window.googletag.pubads())
            
            if (slot) {
              window.googletag.display(divId)
              console.log('[GAM] Defined slot:', fullPath, size)
            }
            
            return slot
          })
        },
        
        // Define slot with size mapping for responsive ads
        defineResponsiveSlot(
          adUnitPath: string, 
          sizeMapping: { viewport: number[], sizes: number[][] }[],
          divId: string
        ) {
          window.googletag.cmd.push(() => {
            const fullPath = adUnitPath.startsWith('/') 
              ? adUnitPath 
              : `/${networkCode}/${adUnitPath}`
            
            // Build size mapping
            const mapping = window.googletag.sizeMapping()
            sizeMapping.forEach(({ viewport, sizes }) => {
              mapping.addSize(viewport, sizes)
            })
            const builtMapping = mapping.build()
            
            // Get all sizes for initial definition
            const allSizes = sizeMapping.flatMap(m => m.sizes).filter(s => s.length > 0)
            const uniqueSizes = [...new Map(allSizes.map(s => [s.join('x'), s])).values()]
            
            const slot = window.googletag
              .defineSlot(fullPath, uniqueSizes, divId)
              ?.defineSizeMapping(builtMapping)
              ?.addService(window.googletag.pubads())
            
            if (slot) {
              window.googletag.display(divId)
              console.log('[GAM] Defined responsive slot:', fullPath, uniqueSizes)
            }
            
            return slot
          })
        },
        
        // Use pre-configured placement
        usePlacement(placementName: string, divId: string) {
          const placement = DEFAULT_PLACEMENTS[placementName]
          if (!placement) {
            console.warn('[GAM] Unknown placement:', placementName)
            return
          }
          
          if (placement.sizeMapping) {
            this.defineResponsiveSlot(placementName, placement.sizeMapping, divId)
          } else {
            this.defineSlot(placementName, placement.sizes, divId)
          }
        },
        
        // Destroy a specific slot
        destroySlot(divId: string) {
          window.googletag.cmd.push(() => {
            const slots = window.googletag.pubads().getSlots()
            const slot = slots.find((s: any) => s.getSlotElementId() === divId)
            if (slot) {
              window.googletag.destroySlots([slot])
            }
          })
        },
        
        // Refresh ads (useful for SPAs)
        refresh(divIds?: string[]) {
          window.googletag.cmd.push(() => {
            if (divIds) {
              const slots = window.googletag.pubads().getSlots()
              const targetSlots = slots.filter((s: any) => divIds.includes(s.getSlotElementId()))
              window.googletag.pubads().refresh(targetSlots)
            } else {
              window.googletag.pubads().refresh()
            }
          })
        },
        
        // Clear all slots (for route changes)
        clearAll() {
          window.googletag.cmd.push(() => {
            window.googletag.destroySlots()
          })
        },
        
        // Set targeting for all ads
        setTargeting(key: string, value: string | string[]) {
          window.googletag.cmd.push(() => {
            window.googletag.pubads().setTargeting(key, value)
          })
        },
        
        // Set page-level category targeting
        setCategory(category: string) {
          this.setTargeting('category', category)
        }
      },
      
      // Export placements for reference
      gamPlacements: DEFAULT_PLACEMENTS,
      iabSizes: IAB_SIZES,
    }
  }
})
