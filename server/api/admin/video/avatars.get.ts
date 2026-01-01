import { requireAdminAuth } from '~/server/utils/admin-auth'

// List available HeyGen avatars
export default defineEventHandler(async (event) => {
  await requireAdminAuth(event)
  
  const config = useRuntimeConfig()
  const apiKey = config.heygenApiKey
  
  if (!apiKey) {
    throw createError({
      statusCode: 400,
      message: 'HeyGen API key not configured'
    })
  }
  
  try {
    const response = await fetch('https://api.heygen.com/v2/avatars', {
      headers: {
        'X-Api-Key': apiKey,
        'Accept': 'application/json',
      },
    })
    
    const data = await response.json()
    
    if (!response.ok) {
      throw new Error(data.message || 'Failed to fetch avatars')
    }
    
    // Return avatar list with key fields
    const avatars = data.data?.avatars || []
    
    return {
      avatars: avatars.map((avatar: any) => ({
        avatar_id: avatar.avatar_id,
        avatar_name: avatar.avatar_name,
        gender: avatar.gender,
        preview_image_url: avatar.preview_image_url,
        avatar_style: avatar.avatar_style,
      })),
      total: avatars.length,
    }
  } catch (error: any) {
    console.error('[HeyGen] Failed to fetch avatars:', error)
    throw createError({
      statusCode: 500,
      message: error.message || 'Failed to fetch avatars'
    })
  }
})
