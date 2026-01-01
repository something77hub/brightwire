import { getStoriesCollection } from '~/server/utils/db'

export default defineEventHandler(async (event) => {
  // Prevent caching to ensure fresh data
  setHeader(event, 'Cache-Control', 'no-cache, no-store, must-revalidate')

  const query = getQuery(event)
  const page = parseInt(query.page as string) || 1
  const limit = parseInt(query.limit as string) || 12

  try {
    const stories = await getStoriesCollection()

    // Show all stories sorted by newest
    // Auto-cleanup handles old article removal
    const dateFilter = {}

    const total = await stories.countDocuments(dateFilter)

    const results = await stories
      .find(dateFilter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .toArray()

    return {
      stories: results,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
        hasMore: page * limit < total,
      },
    }
  } catch (error) {
    console.error('Today stories error:', error)
    throw createError({
      statusCode: 500,
      message: 'Failed to fetch today\'s stories',
    })
  }
})
