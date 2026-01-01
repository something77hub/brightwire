import { getStoriesCollection } from '~/server/utils/db'

export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const q = (query.q as string || '').trim()
  
  if (!q || q.length < 2) {
    return { stories: [] }
  }

  try {
    const stories = await getStoriesCollection()
    
    // Search in title and summary using regex (case-insensitive)
    const results = await stories
      .find({
        $or: [
          { title: { $regex: q, $options: 'i' } },
          { summary: { $regex: q, $options: 'i' } },
          { tags: { $regex: q, $options: 'i' } },
        ]
      })
      .sort({ publishedAt: -1 })
      .limit(20)
      .toArray()

    return { stories: results }
  } catch (error) {
    console.error('Search error:', error)
    throw createError({
      statusCode: 500,
      message: 'Search failed',
    })
  }
})
