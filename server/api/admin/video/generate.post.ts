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


    // Fetch all linked articles to get their images
    let allImages: string[] = []
    if (linkedArticleIds.length > 0) {
      try {
        const { MongoClient, ObjectId } = await import('mongodb')
        const client = new MongoClient(config.mongodbUri!)
        await client.connect()
        const db = client.db('brightwire')
        const stories = db.collection('stories')

        // Find all articles
        const objectIds = linkedArticleIds.map((id: string) => new ObjectId(id))
        const articles = await stories.find({ _id: { $in: objectIds } }).toArray()

        // Collect all images from all articles
        articles.forEach((article: any) => {
          if (article.image) allImages.push(article.image)
          if (article.images && Array.isArray(article.images)) {
            allImages.push(...article.images)
          }
        })

        // Remove duplicates and invalid URLs
        allImages = [...new Set(allImages)].filter(url => url && url.startsWith('http'))

        console.log(`[HeyGen] Found ${allImages.length} images for background rotation`)

        await client.close()
      } catch (e) {
        console.error('[HeyGen] Failed to fetch article images:', e)
      }
    }


    // Use provided segments if available, otherwise split by paragraphs
    const rawSegments = body.segments || trimmedScript.split(/\n\n+/).filter((p: string) => p.trim().length > 0).map((text: string) => ({ text }))

    // Create video scenes
    const scenes = await Promise.all(rawSegments.map(async (segment: any, index: number) => {
      let bgImage = null

      // If segment is linked to a specific article, try to get its image
      if (segment.articleId) {
        // Find cached image or fetch fresh
        // For simplicity reusing the bulk fetch logic's cache if we had it, but here we might need to lookup specific
        // We already fetched ALL images into `allImages` but we lost the mapping. 
        // Let's rely on the random rotation for unlinked segments, but try to be specific for linked ones.

        try {
          const { MongoClient, ObjectId } = await import('mongodb')
          const client = new MongoClient(config.mongodbUri!)
          await client.connect()
          const db = client.db('brightwire')
          const story = await db.collection('stories').findOne({ _id: new ObjectId(segment.articleId) })
          if (story && story.image) {
            bgImage = story.image
          }
          await client.close()
        } catch (e) {
          console.error('Failed to fetch specific article image', e)
        }
      }

      // Fallback: If no specific image, rotate through the global pool we fetched earlier
      if (!bgImage && allImages.length > 0) {
        bgImage = allImages[index % allImages.length]
      }

      return {
        character: {
          type: 'avatar',
          avatar_id: finalAvatarId,
          avatar_style: 'closeUp',
        },
        voice: {
          type: 'text',
          input_text: segment.text, // Use segment text
          voice_id: finalVoiceId,
          speed: 1.05,
        },
        background: bgImage
          ? { type: 'image', url: bgImage }
          : { type: 'color', value: '#FFFBEB' },
      }
    }))

    // HeyGen API v2 - Create video
    const response = await fetch('https://api.heygen.com/v2/video/generate', {
      method: 'POST',
      headers: {
        'X-Api-Key': apiKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        video_inputs: scenes, // Send multiple scenes
        dimension: {
          width: 720,
          height: 1280,
        },
        aspect_ratio: '9:16',
        test: false,
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
