import { requireAdminAuth } from '~/server/utils/admin-auth'

// Check video generation status
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
  
  const videoId = getRouterParam(event, 'id')
  
  if (!videoId) {
    throw createError({
      statusCode: 400,
      message: 'Video ID is required'
    })
  }
  
  try {
    // Check status with HeyGen API
    const response = await fetch(`https://api.heygen.com/v1/video_status.get?video_id=${videoId}`, {
      method: 'GET',
      headers: {
        'X-Api-Key': apiKey,
      },
    })
    
    const data = await response.json()
    
    console.log('[HeyGen] Status response:', JSON.stringify(data))
    
    if (!response.ok) {
      throw createError({
        statusCode: response.status,
        message: data.error?.message || 'Failed to check video status'
      })
    }
    
    // Update database with new status
    const { MongoClient } = await import('mongodb')
    const client = new MongoClient(config.mongodbUri!)
    
    try {
      await client.connect()
      const db = client.db('brightwire')
      const videos = db.collection('generated_videos')
      
      const status = data.data?.status || 'unknown'
      const videoUrl = data.data?.video_url
      const thumbnailUrl = data.data?.thumbnail_url
      const errorMessage = data.data?.error?.message || data.data?.error || null
      
      await videos.updateOne(
        { videoId },
        {
          $set: {
            status,
            videoUrl,
            thumbnailUrl,
            errorMessage,
            updatedAt: new Date(),
            heygenStatus: data.data,
          }
        }
      )
    } finally {
      await client.close()
    }
    
    return {
      success: true,
      videoId,
      status: data.data?.status,
      videoUrl: data.data?.video_url,
      thumbnailUrl: data.data?.thumbnail_url,
      duration: data.data?.duration,
      error: data.data?.error?.message || data.data?.error || null,
    }
  } catch (error: any) {
    if (error.statusCode) throw error
    
    console.error('[HeyGen] Status check error:', error)
    throw createError({
      statusCode: 500,
      message: error.message || 'Failed to check video status'
    })
  }
})
