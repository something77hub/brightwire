import { requireAdminAuth } from '~/server/utils/admin-auth'

// Post to social media via Ayrshare
export default defineEventHandler(async (event) => {
  await requireAdminAuth(event)
  
  const config = useRuntimeConfig()
  const apiKey = config.ayrshareApiKey
  
  if (!apiKey) {
    throw createError({
      statusCode: 400,
      message: 'Ayrshare API key not configured. Add AYRSHARE_API_KEY to environment variables.'
    })
  }
  
  const body = await readBody(event)
  console.log('[Ayrshare] Received body:', JSON.stringify(body))
  console.log('[Ayrshare] POST CONTENT PREVIEW (first 300 chars):', body.post?.slice(0, 300))
  
  const { post, platforms, mediaUrl, scheduleDate } = body
  
  if (!post) {
    throw createError({
      statusCode: 400,
      message: 'Post content is required'
    })
  }
  
  if (!platforms || !Array.isArray(platforms) || platforms.length === 0) {
    console.log('[Ayrshare] Invalid platforms:', platforms)
    throw createError({
      statusCode: 400,
      message: 'At least one platform is required. Make sure you have connected social accounts on ayrshare.com first.'
    })
  }
  
  // Normalize platform names to lowercase (Ayrshare expects lowercase)
  const normalizedPlatforms = platforms.map((p: string) => p.toLowerCase())
  
  console.log('[Ayrshare] Platforms to post to:', normalizedPlatforms)
  
  try {
    // Build the Ayrshare request
    const requestBody: any = {
      post,
      platforms: normalizedPlatforms
    }
    
    // Add media if provided
    if (mediaUrl) {
      requestBody.mediaUrls = [mediaUrl]
    }
    
    // Add schedule if provided
    if (scheduleDate) {
      requestBody.scheduleDate = new Date(scheduleDate).toISOString()
    }
    
    console.log('[Ayrshare] Sending to API:', JSON.stringify(requestBody))
    
    // Make the API call
    const response = await fetch('https://app.ayrshare.com/api/post', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify(requestBody)
    })
    
    const data = await response.json()
    console.log('[Ayrshare] API response:', JSON.stringify(data))
    
    // Check for Ayrshare error status (even with 200 response)
    if (data.status === 'error' || data.errors?.length > 0) {
      console.error('[Ayrshare] Post failed:', data)
      
      // Extract specific error messages
      const errorMessages = data.errors?.map((e: any) => {
        if (e.code === 190 && e.message?.includes('quota')) {
          return `${e.platform}: 24-hour post limit reached (50 posts/day)`
        }
        return `${e.platform}: ${e.message}`
      }).join('; ')
      
      throw createError({
        statusCode: 429,
        message: errorMessages || data.message || 'Failed to post to social media'
      })
    }
    
    if (!response.ok) {
      console.error('[Ayrshare] Post failed:', data)
      throw createError({
        statusCode: response.status,
        message: data.message || data.error || 'Failed to post to social media'
      })
    }
    
    console.log(`[Social] Posted to ${normalizedPlatforms.join(', ')} successfully`)
    
    return {
      success: true,
      postIds: data.postIds || [],
      platforms: data.platforms || normalizedPlatforms,
      scheduled: !!scheduleDate,
      message: scheduleDate 
        ? `Scheduled for ${new Date(scheduleDate).toLocaleString()}`
        : 'Posted successfully!'
    }
  } catch (error: any) {
    if (error.statusCode) throw error
    
    console.error('[Ayrshare] Post error:', error)
    throw createError({
      statusCode: 500,
      message: error.message || 'Failed to post to social media'
    })
  }
})
