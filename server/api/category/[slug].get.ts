import { getStoriesCollection } from '~/server/utils/db'

export default defineEventHandler(async (event) => {
  // Prevent caching to ensure fresh data
  setHeader(event, 'Cache-Control', 'no-cache, no-store, must-revalidate')
  
  const slug = getRouterParam(event, 'slug')
  const query = getQuery(event)
  
  const limit = Math.min(Number(query.limit) || 12, 50)
  const page = Math.max(Number(query.page) || 1, 1)
  const skip = (page - 1) * limit

  console.log(`[Category API] ========================================`)
  console.log(`[Category API] Endpoint hit: /api/category/${slug}`)
  console.log(`[Category API] Fetching category: ${slug}, page: ${page}, limit: ${limit}`)

  try {
    const stories = await getStoriesCollection()
    
    const filter: Record<string, any> = {}
    if (slug && slug !== 'all') {
      filter.category = slug
    }

    const results = await stories
      .find(filter)
      .sort({ publishedAt: -1 })
      .skip(skip)
      .limit(limit)
      .toArray()

    const total = await stories.countDocuments(filter)

    console.log(`[Category API] Found ${results.length} stories for "${slug}", total: ${total}`)
    console.log(`[Category API] ========================================`)

    return {
      stories: results,
      category: slug,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasMore: skip + results.length < total,
      },
    }
  } catch (error) {
    console.error('Error fetching category stories:', error)
    throw createError({
      statusCode: 500,
      message: 'Failed to fetch stories',
    })
  }
})
