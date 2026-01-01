import { requireAdminAuth } from '~/server/utils/admin-auth'

// Test Ayrshare API key and return connected platforms
export default defineEventHandler(async (event) => {
  await requireAdminAuth(event)
  
  const body = await readBody(event)
  const apiKey = body.apiKey
  
  if (!apiKey) {
    throw createError({
      statusCode: 400,
      message: 'API key is required'
    })
  }
  
  try {
    // Test the API key by getting user profile
    const response = await fetch('https://app.ayrshare.com/api/user', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${apiKey}`
      }
    })
    
    if (!response.ok) {
      const error = await response.json()
      throw createError({
        statusCode: 401,
        message: error.message || 'Invalid API key'
      })
    }
    
    const data = await response.json()
    
    // Extract connected platforms
    const platforms: string[] = []
    if (data.activeSocialAccounts) {
      for (const [platform, info] of Object.entries(data.activeSocialAccounts)) {
        if (info) {
          platforms.push(platform)
        }
      }
    }
    
    // Note: In production, you'd save this key to database or env
    // For now, we just validate it and return the platforms
    // User needs to add AYRSHARE_API_KEY to Vercel env vars
    
    return {
      success: true,
      platforms,
      displayName: data.displayName || 'Connected',
      message: platforms.length > 0 
        ? `Connected! Add this key as AYRSHARE_API_KEY in your Vercel environment variables.`
        : 'API key valid but no social accounts connected. Connect accounts at ayrshare.com'
    }
  } catch (error: any) {
    if (error.statusCode) throw error
    
    console.error('Ayrshare connect error:', error)
    throw createError({
      statusCode: 500,
      message: 'Failed to connect to Ayrshare'
    })
  }
})
