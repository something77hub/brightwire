// Composable to get site settings including siteUrl
// Database value ALWAYS wins over env var

export const useSiteSettings = async () => {
  const config = useRuntimeConfig()
  
  // Fetch site settings from API (short cache to pick up admin changes)
  const { data: settings } = await useFetch('/api/site-settings', {
    key: 'site-settings',
    // Refresh every 5 minutes to pick up admin changes
    getCachedData: (key, nuxtApp) => {
      const cached = nuxtApp.payload.data[key] || nuxtApp.static.data[key]
      if (!cached) return null
      // Cache for 5 minutes
      const expiresAt = cached._fetchedAt + 5 * 60 * 1000
      if (Date.now() > expiresAt) return null
      return cached
    },
    transform: (data) => ({ ...data, _fetchedAt: Date.now() }),
    default: () => ({
      siteName: 'BrightWire',
      siteUrl: '',
      siteDescription: 'Good news daily - positive journalism that inspires.',
      _fetchedAt: 0,
    }),
  })
  
  // Database URL wins, then env var, then default
  const siteUrl = computed(() => {
    const dbUrl = settings.value?.siteUrl?.trim()
    
    // Use database URL if it's a valid http(s) URL
    if (dbUrl && dbUrl.startsWith('http')) {
      return dbUrl.replace(/\/$/, '')
    }
    
    // Fallback to env var if it's not a placeholder
    const envUrl = config.public.siteUrl?.trim()
    if (envUrl && envUrl.startsWith('http') && !envUrl.includes('your-domain') && !envUrl.includes('localhost')) {
      return envUrl.replace(/\/$/, '')
    }
    
    // Final fallback
    return 'https://brightwire.news'
  })
  
  const siteName = computed(() => settings.value?.siteName || 'BrightWire')
  const siteDescription = computed(() => settings.value?.siteDescription || 'Good news daily')
  
  return {
    siteUrl,
    siteName,
    siteDescription,
    settings,
    siteSettings: settings, // Alias for convenience
  }
}
