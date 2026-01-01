import { MongoClient } from 'mongodb'

// Get category distribution - helps debug why all categories show same count
export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const client = new MongoClient(config.mongodbUri)
  
  try {
    await client.connect()
    const db = client.db('brightwire')
    const stories = db.collection('stories')
    
    // Get count per category
    const distribution = await stories.aggregate([
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } }
    ]).toArray()
    
    // Get total
    const total = await stories.countDocuments()
    
    // Get sample of recent articles with their categories
    const recentSamples = await stories
      .find({})
      .sort({ createdAt: -1 })
      .limit(10)
      .project({ title: 1, category: 1, createdAt: 1 })
      .toArray()
    
    // Check for null/undefined categories
    const nullCategories = await stories.countDocuments({ 
      $or: [
        { category: null },
        { category: { $exists: false } },
        { category: '' }
      ]
    })
    
    return {
      total,
      nullCategories,
      distribution: distribution.map(d => ({
        category: d._id || '(none)',
        count: d.count,
        percentage: ((d.count / total) * 100).toFixed(1) + '%'
      })),
      recentSamples: recentSamples.map(s => ({
        title: s.title?.substring(0, 50) + '...',
        category: s.category || '(none)',
        createdAt: s.createdAt
      }))
    }
  } catch (error) {
    console.error('Category stats error:', error)
    throw createError({
      statusCode: 500,
      message: 'Failed to get category stats'
    })
  } finally {
    await client.close()
  }
})
