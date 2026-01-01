import { getStoriesCollection } from '~/server/utils/db'
import type { Story, StoryCategory } from '~/types'

export default defineEventHandler(async (event) => {
  // Prevent caching to ensure fresh data
  setHeader(event, 'Cache-Control', 'no-cache, no-store, must-revalidate')
  
  const query = getQuery(event)
  
  // Get category - treat empty string and 'undefined' as no filter
  const rawCategory = query.category as string | undefined
  const category = (rawCategory && rawCategory !== 'undefined' && rawCategory !== 'all') 
    ? rawCategory as StoryCategory 
    : null
    
  const limit = Math.min(Number(query.limit) || 20, 50)
  const page = Math.max(Number(query.page) || 1, 1)
  const skip = (page - 1) * limit
  const featured = query.featured === 'true'
  
  // Check if this is homepage (no category filter)
  const isHomepage = !category

  try {
    const stories = await getStoriesCollection()
    
    // Build filter
    const filter: Record<string, any> = {}
    
    if (category) {
      filter.category = category
      console.log(`[Stories API] Filtering by category: ${category}`)
    }
    // No date filter for homepage - show all articles sorted by newest first
    // Old articles get auto-deleted after 7 days anyway
    
    if (featured) {
      filter.featured = true
    }

    // Get stories - sort by publishedAt (newest first)
    const results = await stories
      .find(filter)
      .sort({ publishedAt: -1 })
      .skip(skip)
      .limit(limit)
      .toArray()

    // Get total count for pagination
    const total = await stories.countDocuments(filter)
    
    console.log(`[Stories API] Found ${results.length} stories, total: ${total}`)

    return {
      stories: results,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasMore: skip + results.length < total,
      },
    }
  } catch (error) {
    console.error('Error fetching stories:', error)
    throw createError({
      statusCode: 500,
      message: 'Failed to fetch stories',
    })
  }
})
