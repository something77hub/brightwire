import { requireAdminAuth } from '~/server/utils/admin-auth'
import { generateVideoScript, type VideoScene } from '~/server/utils/ai_script'
import { ObjectId } from 'mongodb'

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
  const { title, articleIds, avatarId, voiceId, style } = body

  // Avatar/Voice defaults
  const finalAvatarId = avatarId || config.heygenAvatarId
  if (!finalAvatarId) {
    throw createError({ statusCode: 400, message: 'Please select an avatar.' })
  }
  const finalVoiceId = voiceId || '1bd001e7e50f421d891986aad5158bc8'

  // Validate inputs
  const linkedArticleIds = articleIds || []
  if (linkedArticleIds.length === 0) {
    throw createError({ statusCode: 400, message: 'Select at least one article.' })
  }

  console.log(`[Video Gen] Starting generation for "${title}" with ${linkedArticleIds.length} articles`)

  try {
    // 1. Fetch full articles
    const { MongoClient } = await import('mongodb')
    const client = new MongoClient(config.mongodbUri!)
    await client.connect()
    const db = client.db('brightwire')
    const stories = db.collection('stories')

    const objectIds = linkedArticleIds.map((id: string) => new ObjectId(id))
    const articles = await stories.find({ _id: { $in: objectIds } }).toArray()
    await client.close()

    if (articles.length === 0) {
      throw createError({ statusCode: 404, message: 'Articles not found' })
    }

    // 2. Generate AI Script & Scenes
    console.log('[Video Gen] Generating AI script...')
    const aiScript = await generateVideoScript(articles, style || 'engaging')

    // 3. Construct HeyGen Payload
    const heygenScenes = aiScript.scenes.map((scene: VideoScene) => {
      let bgImage = null

      if (scene.type === 'story' && scene.articleId) {
        // Strict alignment: Find the exact article
        const article = articles.find((a: any) =>
          a._id.toString() === scene.articleId || a.guid === scene.articleId
        )
        if (article) {
          // Priority: images[0] (hero) > imageUrl > image
          bgImage = article.images?.[0] || article.imageUrl || article.image
        }
      }

      // Fallback/Intro/Outro Backgrounds
      // Use branded color for intro/outro to differentiate and prevent compositing issues
      const background = bgImage
        ? { type: 'image', url: bgImage, fit: 'cover' }
        : { type: 'color', value: '#FFFBEB' } // BrightWire amber/white theme

      return {
        character: {
          type: 'avatar',
          avatar_id: finalAvatarId,
          avatar_style: 'closeUp', // Force closeUp for better "TikTok" feel
        },
        voice: {
          type: 'text',
          input_text: scene.text,
          voice_id: finalVoiceId,
          speed: 1.05,
        },
        background,
      }
    })

    console.log(`[Video Gen] Created ${heygenScenes.length} scenes. Sending to HeyGen...`)

    // 4. Call HeyGen
    const response = await fetch('https://api.heygen.com/v2/video/generate', {
      method: 'POST',
      headers: {
        'X-Api-Key': apiKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        video_inputs: heygenScenes,
        dimension: { width: 720, height: 1280 }, // 9:16 Vertical
        aspect_ratio: '9:16',
        test: false,
      }),
    })

    const data = await response.json()

    if (!response.ok || data.error) {
      console.error('[HeyGen] API Error:', data)
      throw createError({
        statusCode: response.status,
        message: data.error?.message || 'HeyGen API failed'
      })
    }

    // 5. Save Record
    const clientRecord = new MongoClient(config.mongodbUri!)
    await clientRecord.connect()
    const dbRecord = clientRecord.db('brightwire')
    await dbRecord.collection('generated_videos').insertOne({
      videoId: data.data?.video_id,
      articleIds: linkedArticleIds,
      title: aiScript.title || title,
      script: aiScript.scenes.map(s => s.text).join('\n\n'), // Flatten for record
      scenes: aiScript.scenes, // Store structure for debugging
      avatarId: finalAvatarId,
      voiceId: finalVoiceId,
      status: 'processing',
      createdAt: new Date(),
      heygenResponse: data,
    })
    await clientRecord.close()

    return {
      success: true,
      videoId: data.data?.video_id,
      title: aiScript.title,
      message: 'Video generation started with AI Script!'
    }

  } catch (error: any) {
    console.error('[Video Gen] Error:', error)
    if (error.statusCode) throw error
    throw createError({ statusCode: 500, message: error.message || 'Server error' })
  }
})
