import { requireAdminAuth } from '~/server/utils/admin-auth'

// Check Ayrshare connection status
export default defineEventHandler(async (event) => {
  await requireAdminAuth(event)
  
  const config = useRuntimeConfig()
  const apiKey = config.ayrshareApiKey
  
  if (!apiKey) {
    return {
      connected: false,
      platforms: []
    }
  }
  
  try {
    // Get user profile from Ayrshare
    const response = await fetch('https://app.ayrshare.com/api/user', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${apiKey}`
      }
    })
    
    if (!response.ok) {
      console.log('[Ayrshare] Status check failed:', response.status)
      return {
        connected: false,
        platforms: []
      }
    }
    
    const data = await response.json()
    console.log('[Ayrshare] Raw response:', JSON.stringify(data))
    
    // Extract connected platforms - handle ALL possible response formats
    const platforms: string[] = []
    
    // Format 1: activeSocialAccounts as object { twitter: {...}, instagram: {...} }
    if (data.activeSocialAccounts && typeof data.activeSocialAccounts === 'object' && !Array.isArray(data.activeSocialAccounts)) {
      for (const [platform, info] of Object.entries(data.activeSocialAccounts)) {
        if (info && typeof platform === 'string') {
          platforms.push(platform.toLowerCase())
        }
      }
    }
    
    // Format 2: activeSocialAccounts as array ['twitter', 'instagram']
    if (Array.isArray(data.activeSocialAccounts)) {
      for (const platform of data.activeSocialAccounts) {
        if (typeof platform === 'string') {
          platforms.push(platform.toLowerCase())
        } else if (platform && platform.platform) {
          platforms.push(platform.platform.toLowerCase())
        }
      }
    }
    
    // Format 3: socialNetworks array
    if (Array.isArray(data.socialNetworks)) {
      for (const network of data.socialNetworks) {
        const name = typeof network === 'string' ? network : network?.platform || network?.name
        if (name && !platforms.includes(name.toLowerCase())) {
          platforms.push(name.toLowerCase())
        }
      }
    }
    
    // Format 4: profiles array
    if (Array.isArray(data.profiles)) {
      for (const profile of data.profiles) {
        const name = profile.platform || profile.socialNetwork
        if (name && !platforms.includes(name.toLowerCase())) {
          platforms.push(name.toLowerCase())
        }
      }
    }
    
    // Format 5: Direct platform flags
    const platformFlags = ['twitter', 'instagram', 'facebook', 'linkedin', 'tiktok', 'pinterest', 'youtube']
    for (const p of platformFlags) {
      if (data[p] && !platforms.includes(p)) {
        platforms.push(p)
      }
    }
    
    console.log('[Ayrshare] Final platforms:', platforms)
    
    return {
      connected: true,
      platforms,
      displayName: data.displayName || data.email || 'Connected'
    }
  } catch (error) {
    console.error('Ayrshare status check error:', error)
    return {
      connected: false,
      platforms: []
    }
  }
})
