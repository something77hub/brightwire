import { getStoriesCollection } from '~/server/utils/db'

export default defineEventHandler(async (event) => {
  try {
    const stories = await getStoriesCollection()
    
    // Get articles from the last 30 days
    const monthAgo = new Date()
    monthAgo.setDate(monthAgo.getDate() - 30)
    
    // Aggregate tags from recent articles
    const result = await stories.aggregate([
      {
        $match: {
          publishedAt: { $gte: monthAgo }
        }
      },
      {
        $unwind: '$tags'
      },
      {
        $group: {
          _id: '$tags',
          count: { $sum: 1 }
        }
      },
      {
        $match: {
          count: { $gte: 1 } // Tags that appear in at least 1 article
        }
      },
      {
        $sort: { count: -1 }
      },
      {
        $limit: 5
      }
    ]).toArray()
    
    // Return tag names
    let trendingTags = result.map(r => r._id)
    
    // If no tags, get top categories by article count
    if (trendingTags.length === 0) {
      const categoryResult = await stories.aggregate([
        {
          $match: {
            publishedAt: { $gte: monthAgo }
          }
        },
        {
          $group: {
            _id: '$category',
            count: { $sum: 1 }
          }
        },
        {
          $sort: { count: -1 }
        },
        {
          $limit: 5
        }
      ]).toArray()
      
      // Map category slugs to display names
      const categoryLabels: Record<string, string> = {
        'good-news': 'Good News',
        'heroes': 'Community Heroes',
        'planet': 'Planet Wins',
        'innovation': 'Innovation',
        'solutions': 'Solutions',
      }
      
      trendingTags = categoryResult.map(r => categoryLabels[r._id] || r._id)
    }
    
    return { tags: trendingTags }
  } catch (error) {
    console.error('Trending tags error:', error)
    return { tags: [] }
  }
})
