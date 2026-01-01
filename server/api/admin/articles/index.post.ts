import { MongoClient, ObjectId } from 'mongodb'
import { requireAdminAuth } from '~/server/utils/admin-auth'

// POST - Create new article
export default defineEventHandler(async (event) => {
  requireAdminAuth(event)
  
  const body = await readBody(event)
  const config = useRuntimeConfig()
  const client = new MongoClient(config.mongodbUri)
  
  try {
    await client.connect()
    const db = client.db('brightwire')
    const stories = db.collection('stories')
    
    // Get default author from settings
    const settings = await db.collection('settings').findOne({ _id: 'site-settings' as any })
    const defaultAuthor = settings?.defaultAuthor || 'Felix Utomi'
    
    // Generate unique guid
    const guid = `manual-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    
    const article = {
      guid,
      slug: body.slug,
      title: body.title,
      summary: body.summary,
      content: body.content,
      originalSource: body.originalSource || (body.isSponsored ? 'Sponsored Content' : 'BrightWire'),
      category: body.category,
      score: body.isSponsored ? 0 : 85, // Sponsored articles don't have positivity score
      imageUrl: body.imageUrl || undefined,
      images: body.imageUrl ? [body.imageUrl] : [],
      author: defaultAuthor,
      readTime: body.readTime || Math.ceil(body.content?.split(/\s+/).length / 200) || 1,
      publishedAt: body.publishedAt ? new Date(body.publishedAt) : new Date(),
      createdAt: new Date(),
      featured: body.featured || false,
      tags: body.tags || [],
      status: body.status || 'draft',
      isSponsored: body.isSponsored || false,
      advertiser: body.advertiser || undefined,
      sponsorLink: body.sponsorLink || undefined,
    }
    
    const result = await stories.insertOne(article)
    
    return { 
      success: true, 
      id: result.insertedId.toString(),
      message: 'Article created successfully'
    }
  } finally {
    await client.close()
  }
})
