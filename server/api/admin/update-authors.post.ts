import { MongoClient } from 'mongodb'
import { requireAdminAuth } from '~/server/utils/admin-auth'

// POST /api/admin/update-authors
// Updates all articles to use the default author name from settings
export default defineEventHandler(async (event) => {
  requireAdminAuth(event)
  
  const config = useRuntimeConfig()
  const client = new MongoClient(config.mongodbUri)
  
  try {
    await client.connect()
    const db = client.db('brightwire')
    
    // Get default author from settings
    const settings = await db.collection('settings').findOne({ _id: 'site-settings' as any })
    const newAuthor = settings?.defaultAuthor || 'Felix Utomi'
    
    // Update all articles
    const result = await db.collection('stories').updateMany(
      {}, // all documents
      { $set: { author: newAuthor } }
    )
    
    return {
      success: true,
      message: `Updated ${result.modifiedCount} articles to author: "${newAuthor}"`,
      modifiedCount: result.modifiedCount,
    }
  } catch (error) {
    console.error('Update authors error:', error)
    throw createError({
      statusCode: 500,
      message: 'Failed to update authors',
    })
  } finally {
    await client.close()
  }
})
