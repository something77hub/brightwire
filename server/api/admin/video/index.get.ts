import { requireAdminAuth } from '~/server/utils/admin-auth'
import { MongoClient } from 'mongodb'

// List all generated videos
export default defineEventHandler(async (event) => {
  await requireAdminAuth(event)
  
  const config = useRuntimeConfig()
  const client = new MongoClient(config.mongodbUri!)
  
  try {
    await client.connect()
    const db = client.db('brightwire')
    const videos = db.collection('generated_videos')
    
    const allVideos = await videos
      .find({})
      .sort({ createdAt: -1 })
      .limit(50)
      .toArray()
    
    return {
      success: true,
      videos: allVideos.map(v => ({
        id: v._id,
        videoId: v.videoId,
        articleId: v.articleId,
        title: v.title,
        status: v.status,
        videoUrl: v.videoUrl,
        thumbnailUrl: v.thumbnailUrl,
        createdAt: v.createdAt,
        errorMessage: v.errorMessage,
        scriptPreview: v.script?.slice(0, 100) + '...',
      })),
    }
  } finally {
    await client.close()
  }
})
