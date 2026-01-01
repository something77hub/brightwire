import { MongoClient } from 'mongodb'
import type { AdPlacement, StoryCategory } from '~/types'

// Public endpoint - returns active ads for a specific placement
export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const placement = query.placement as AdPlacement
  const category = query.category as StoryCategory | undefined
  const count = Math.min(Math.max(parseInt(query.count as string) || 1, 1), 5) // 1-5 ads
  
  if (!placement) {
    return { ads: [] } // Return empty instead of error for graceful degradation
  }
  
  const config = useRuntimeConfig()
  const client = new MongoClient(config.mongodbUri)
  
  try {
    await client.connect()
    const db = client.db('brightwire')
    const ads = db.collection('advertisements')
    
    const now = new Date()
    
    // Find active ads for this placement
    const filter: Record<string, any> = {
      status: 'active',
      placement: placement,
      startDate: { $lte: now },
      endDate: { $gte: now },
      // Budget check: either no budget set, or spent < budget
      $or: [
        { budget: { $exists: false } },
        { budget: null },
        { $expr: { $lt: [{ $ifNull: ['$spent', 0] }, '$budget'] } },
      ],
    }
    
    // Build aggregation pipeline for category filtering
    const pipeline: any[] = [
      { $match: filter },
    ]
    
    // If category specified, filter by target categories
    if (category) {
      pipeline.push({
        $match: {
          $or: [
            { targetCategories: { $size: 0 } },
            { targetCategories: { $exists: false } },
            { targetCategories: null },
            { targetCategories: category },
          ],
        },
      })
    }
    
    // Add computed weight field for priority-based selection
    // Weight = priority (1-10, default 5) * weight multiplier (default 1)
    // Higher weight = more likely to be selected
    pipeline.push({
      $addFields: {
        computedWeight: {
          $multiply: [
            { $ifNull: ['$priority', 5] },
            { $ifNull: ['$weight', 1] }
          ]
        }
      }
    })
    
    // Sort by computed weight (higher first), then random within same weight
    pipeline.push({
      $addFields: {
        randomSort: { $rand: {} }
      }
    })
    pipeline.push({
      $sort: { computedWeight: -1, randomSort: 1 }
    })
    
    // Limit to requested count
    pipeline.push({ $limit: count })
    
    // Only return public fields
    pipeline.push({
      $project: {
        _id: 1,
        type: 1,
        placement: 1,
        headline: 1,
        description: 1,
        imageUrl: 1,
        linkUrl: 1,
        ctaText: 1,
        advertiser: 1,
        sponsorText: 1,
        sponsoredCategory: 1,
        priority: 1,
      },
    })
    
    const results = await ads.aggregate(pipeline).toArray()
    
    return { 
      ads: results,
      // Include count info for client
      requested: count,
      returned: results.length,
    }
  } catch (error) {
    console.error('Ads fetch error:', error)
    return { ads: [] } // Graceful degradation
  } finally {
    await client.close()
  }
})
