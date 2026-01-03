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

    // Map DB results to a lookup
    const dbCounts: Record<string, number> = {}
    distribution.forEach((d: any) => {
      if (d._id) dbCounts[d._id] = d.count
    })

    // Known categories to always include
    const knownCategories = [
      'health', 'heroes', 'planet', 'innovation', 'solutions',
      'kindness', 'sports', 'video', 'world'
    ]

    // Create the full distribution list
    const fullDistribution = knownCategories.map(cat => ({
      _id: cat,
      count: dbCounts[cat] || 0
    }))

    // Add any 'other' categories found in DB but not in known list
    Object.keys(dbCounts).forEach(key => {
      if (!knownCategories.includes(key)) {
        fullDistribution.push({ _id: key, count: dbCounts[key] })
      }
    })

    // Resort by count descending
    fullDistribution.sort((a, b) => b.count - a.count)

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
      distribution: fullDistribution.map(d => ({
        category: d._id || '(none)',
        count: d.count,
        percentage: total > 0 ? ((d.count / total) * 100).toFixed(1) + '%' : '0.0%'
      })),
      recentSamples: recentSamples.map(s => ({
        title: s.title?.substring(0, 50) + '...',
        category: s.category || '(none)',
        createdAt: s.createdAt
      }))
    }
  } catch (error: any) {
    console.error('Category stats error:', error)
    throw createError({
      statusCode: 500,
      message: 'Failed to get category stats'
    })
  } finally {
    await client.close()
  }
})
