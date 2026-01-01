import { MongoClient } from 'mongodb'
import { requireAdminAuth } from '~/server/utils/admin-auth'

export default defineEventHandler(async (event) => {
  // Require admin authentication
  requireAdminAuth(event)
  
  const body = await readBody(event)
  const deleteAll = body?.deleteAll === true
  
  const client = new MongoClient(process.env.MONGODB_URI!)
  
  try {
    await client.connect()
    const db = client.db('brightwire')
    const stories = db.collection('stories')
    
    if (deleteAll) {
      // Delete ALL articles
      const result = await stories.deleteMany({})
      return {
        success: true,
        deleted: result.deletedCount,
        message: `Deleted all ${result.deletedCount} articles`
      }
    }
    
    // Default: delete articles older than 7 days
    const maxAgeDays = body?.maxAgeDays || 7
    const cutoffDate = new Date()
    cutoffDate.setDate(cutoffDate.getDate() - maxAgeDays)
    
    const result = await stories.deleteMany({
      publishedAt: { $lt: cutoffDate }
    })
    
    return {
      success: true,
      deleted: result.deletedCount,
      message: `Deleted ${result.deletedCount} articles older than ${maxAgeDays} days`
    }
  } catch (error: any) {
    console.error('Cleanup error:', error)
    throw createError({
      statusCode: 500,
      message: error.message || 'Failed to cleanup articles'
    })
  } finally {
    await client.close()
  }
})
