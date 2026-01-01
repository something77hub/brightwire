import { MongoClient, ObjectId } from 'mongodb'
import { requireAdminAuth } from '~/server/utils/admin-auth'

export default defineEventHandler(async (event) => {
  requireAdminAuth(event)
  
  const id = event.context.params?.id
  if (!id) {
    throw createError({ statusCode: 400, message: 'Ad ID required' })
  }
  
  const method = event.method
  const config = useRuntimeConfig()
  const client = new MongoClient(config.mongodbUri)
  
  try {
    await client.connect()
    const db = client.db('brightwire')
    const ads = db.collection('advertisements')
    
    // GET - Get single ad
    if (method === 'GET') {
      const ad = await ads.findOne({ _id: new ObjectId(id) })
      if (!ad) {
        throw createError({ statusCode: 404, message: 'Ad not found' })
      }
      return { ad }
    }
    
    // PUT - Update ad
    if (method === 'PUT') {
      const body = await readBody(event)
      
      const update: Record<string, any> = {
        updatedAt: new Date(),
      }
      
      // Only update provided fields
      const fields = [
        'name', 'advertiser', 'type', 'placement', 'status',
        'headline', 'description', 'imageUrl', 'linkUrl', 'ctaText',
        'articleSlug', 'sponsoredCategory', 'sponsorText',
        'targetCategories', 'priceType', 'priceAmount', 'budget',
        'contactName', 'contactEmail', 'notes'
      ]
      
      for (const field of fields) {
        if (body[field] !== undefined) {
          update[field] = body[field]
        }
      }
      
      // Handle dates
      if (body.startDate) update.startDate = new Date(body.startDate)
      if (body.endDate) update.endDate = new Date(body.endDate)
      
      // Handle numbers
      if (body.priceAmount) update.priceAmount = parseFloat(body.priceAmount)
      if (body.budget) update.budget = parseFloat(body.budget)
      
      const result = await ads.updateOne(
        { _id: new ObjectId(id) },
        { $set: update }
      )
      
      if (result.matchedCount === 0) {
        throw createError({ statusCode: 404, message: 'Ad not found' })
      }
      
      return { success: true, message: 'Ad updated successfully' }
    }
    
    // DELETE - Delete ad
    if (method === 'DELETE') {
      const result = await ads.deleteOne({ _id: new ObjectId(id) })
      
      if (result.deletedCount === 0) {
        throw createError({ statusCode: 404, message: 'Ad not found' })
      }
      
      return { success: true, message: 'Ad deleted successfully' }
    }
    
    throw createError({ statusCode: 405, message: 'Method not allowed' })
  } finally {
    await client.close()
  }
})
