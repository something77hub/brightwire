import { ObjectId } from 'mongodb'
import { getStoriesCollection } from '~/server/utils/db'
import { requireAdminAuth } from '~/server/utils/admin-auth'

export default defineEventHandler(async (event) => {
  requireAdminAuth(event)
  
  const id = getRouterParam(event, 'id')
  const method = getMethod(event)
  
  if (!id) {
    throw createError({ statusCode: 400, message: 'Missing article ID' })
  }
  
  const stories = await getStoriesCollection()
  
  // GET - Fetch single article
  if (method === 'GET') {
    const article = await stories.findOne({ _id: new ObjectId(id) })
    
    if (!article) {
      throw createError({ statusCode: 404, message: 'Article not found' })
    }
    
    return { article }
  }
  
  // DELETE
  if (method === 'DELETE') {
    const result = await stories.deleteOne({ _id: new ObjectId(id) })
    
    if (result.deletedCount === 0) {
      throw createError({ statusCode: 404, message: 'Article not found' })
    }
    
    return { success: true }
  }
  
  // PUT - Full update
  if (method === 'PUT') {
    const body = await readBody(event)
    
    const updates: Record<string, any> = {
      title: body.title,
      slug: body.slug,
      summary: body.summary,
      content: body.content,
      category: body.category,
      imageUrl: body.imageUrl || undefined,
      images: body.imageUrl ? [body.imageUrl] : [],
      tags: body.tags || [],
      originalSource: body.originalSource,
      readTime: body.readTime,
      featured: body.featured || false,
      status: body.status || 'draft',
      isSponsored: body.isSponsored || false,
      advertiser: body.advertiser || undefined,
      sponsorLink: body.sponsorLink || undefined,
      updatedAt: new Date(),
    }
    
    // Set publishedAt if publishing
    if (body.status === 'published' && body.publishedAt) {
      updates.publishedAt = new Date(body.publishedAt)
    }
    
    const result = await stories.updateOne(
      { _id: new ObjectId(id) },
      { $set: updates }
    )
    
    if (result.matchedCount === 0) {
      throw createError({ statusCode: 404, message: 'Article not found' })
    }
    
    return { success: true }
  }
  
  // PATCH - Partial update
  if (method === 'PATCH') {
    const body = await readBody(event)
    
    // Only allow certain fields to be updated
    const allowedFields = ['featured', 'category', 'title', 'summary', 'content', 'status']
    const updates: Record<string, any> = {}
    
    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        updates[field] = body[field]
      }
    }
    
    if (Object.keys(updates).length === 0) {
      throw createError({ statusCode: 400, message: 'No valid fields to update' })
    }
    
    updates.updatedAt = new Date()
    
    const result = await stories.updateOne(
      { _id: new ObjectId(id) },
      { $set: updates }
    )
    
    if (result.matchedCount === 0) {
      throw createError({ statusCode: 404, message: 'Article not found' })
    }
    
    return { success: true }
  }
  
  throw createError({ statusCode: 405, message: 'Method not allowed' })
})
