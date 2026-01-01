import { requireAdminAuth } from '~/server/utils/admin-auth'

// Generate a video using HeyGen API
export default defineEventHandler(async (event) => {
  await requireAdminAuth(event)

  const config = useRuntimeConfig()
  const apiKey = config.heygenApiKey

  if (!apiKey) {
    throw createError({
      statusCode: 400,
      message: 'HeyGen API key not configured. Add HEYGEN_API_KEY to environment variables.'
    })
  }

  const body = await readBody(event)
  const { script, title, articleId, articleIds, avatarId, voiceId } = body

  // Avatar can come from request body or fallback to env var
  const finalAvatarId = avatarId || config.heygenAvatarId

  if (!finalAvatarId) {
    throw createError({
      statusCode: 400,
      message: 'Please select an avatar to generate the video.'
    })
  }

  // Support both single articleId and array of articleIds
  const linkedArticleIds = articleIds || (articleId ? [articleId] : [])

  if (!script || script.length < 10) {
    throw createError({
      statusCode: 400,
      message: 'Script is required (minimum 10 characters)'
    })
  }

  // Limit script length (HeyGen has limits)
  const trimmedScript = script.slice(0, 2500)

  // Default voice if not specified
  const finalVoiceId = voiceId || '1bd001e7e50f421d891986aad5158bc8'

  console.log(`[HeyGen] Generating video for: ${title?.slice(0, 50)}...`)
  console.log(`[HeyGen] Script length: ${trimmedScript.length} chars`)
  console.log(`[HeyGen] Avatar ID: ${finalAvatarId}`)
  console.log(`[HeyGen] Voice ID: ${finalVoiceId}`)
  console.log(`[HeyGen] Linked articles: ${linkedArticleIds.length}`)

  try {
    // HeyGen API v2 - Create video
    const response = await fetch('https://api.heygen.com/v2/video/generate', {
      method: 'POST',
      headers: {
        'X-Api-Key': apiKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        video_inputs: [
          {
            character: {
              type: 'avatar',
              avatar_id: finalAvatarId,
              avatar_style: 'normal', // or 'circle', 'closeUp'
            },
            voice: {
              type: 'text',
              input_text: trimmedScript,
              voice_id: finalVoiceId,
              speed: 1.0,
            },
            background: {
              type: 'color',
              value: '#FFFBEB', // Warm amber background matching BrightWire
            },
          },
        ],
        dimension: {
          width: 720,
          height: 1280, // 720p Vertical for compatibility
        },
        aspect_ratio: '9:16',
        test: false, // Set to true for testing (watermarked but free)
      }),
    })

    const data = await response.json()
    console.log('[HeyGen] API Response:', JSON.stringify(data))

    if (!response.ok || data.error) {
      console.error('[HeyGen] Error:', data)
      throw createError({
        statusCode: response.status,
        message: data.error?.message || data.message || 'Failed to create video'
      })
    }

    // Store video generation info in database for tracking
    const { MongoClient } = await import('mongodb')
    const client = new MongoClient(config.mongodbUri!)

    try {
      await client.connect()
      const db = client.db('brightwire')
      const videos = db.collection('generated_videos')

      await videos.insertOne({
        videoId: data.data?.video_id,
        articleIds: linkedArticleIds,
        title,
        script: trimmedScript,
        avatarId: finalAvatarId,
        voiceId: finalVoiceId,
        status: 'processing',
        createdAt: new Date(),
        heygenResponse: data,
      })
    } finally {
      await client.close()
    }

    return {
      success: true,
      videoId: data.data?.video_id,
      status: 'processing',
      message: 'Video generation started. Check status in a few minutes.',
    }
  } catch (error: any) {
    if (error.statusCode) throw error

    console.error('[HeyGen] Error:', error)
    throw createError({
      statusCode: 500,
      message: error.message || 'Failed to generate video'
    })
  }
})
