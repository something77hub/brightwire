import { MongoClient } from 'mongodb'
import { requireAdminAuth } from '~/server/utils/admin-auth'

// Delete all articles - use with caution!
export default defineEventHandler(async (event) => {
  await requireAdminAuth(event)
  
  const body = await readBody(event)
  const confirmPhrase = body?.confirm
  
  // Require explicit confirmation
  if (confirmPhrase !== 'DELETE ALL ARTICLES') {
    throw createError({
      statusCode: 400,
      message: 'Must confirm with exact phrase: "DELETE ALL ARTICLES"'
    })
  }
  
  const config = useRuntimeConfig()
  const client = new MongoClient(config.mongodbUri)
  
  try {
    await client.connect()
    const db = client.db('brightwire')
    const stories = db.collection('stories')
    
    // Get count before deletion
    const count = await stories.countDocuments()
    
    // Delete all
    const result = await stories.deleteMany({})
    
    return {
      success: true,
      deleted: result.deletedCount,
      message: `Deleted ${result.deletedCount} articles. Fetch new articles to repopulate.`
    }
  } catch (error) {
    console.error('Delete all error:', error)
    throw createError({
      statusCode: 500,
      message: 'Failed to delete articles'
    })
  } finally {
    await client.close()
  }
})
