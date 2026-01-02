import { getStoriesCollection } from '~/server/utils/db'
import type { Story, StoryCategory } from '~/types'

export default defineCachedEventHandler(async (event) => {
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
    }

    // Exclude specific categories if requested
    const exclude = query.exclude as string
    if (exclude && !category) {
      filter.category = { $nin: exclude.split(',') }
    }

    if (featured) {
      filter.featured = true
    }

    // Get stories - sort by publishedAt (newest first)
    let results: Story[] = []

    if (isHomepage && !featured) {
      // HOMEPAGE DIVERSITY LOGIC
      // We want to limit sports/world to ~15% of the feed to prevent them from overwhelming the good news
      const diversityLimit = Math.ceil(limit * 0.15) // ~2 items per 12
      const coreLimit = limit - diversityLimit      // ~10 items per 12

      const diversitySkip = (page - 1) * diversityLimit
      const coreSkip = (page - 1) * coreLimit

      const aggregation = [
        {
          $facet: {
            // Stream 1: Sports & World (Limited)
            diversity: [
              { $match: { ...filter, category: { $in: ['sports', 'world'] } } },
              { $sort: { createdAt: -1 } },
              { $skip: diversitySkip },
              { $limit: diversityLimit }
            ],
            // Stream 2: Core Categories (Majority)
            core: [
              { $match: { ...filter, category: { $nin: ['sports', 'world'] } } },
              { $sort: { createdAt: -1 } },
              { $skip: coreSkip },
              { $limit: coreLimit }
            ]
          }
        }
      ]

      const [faceted] = await stories.aggregate(aggregation).toArray()

      // Merge and sort by date to interleave them naturally
      results = [...(faceted.diversity || []), ...(faceted.core || [])].sort((a, b) => {
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      })

    } else {
      // STANDARD LOGIC (Category pages or filtered)
      results = await stories
        .find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .toArray()
    }

    // Get total count for pagination
    const total = await stories.countDocuments(filter)

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
}, {
  maxAge: 60,
  swr: true,
  name: 'stories-api',
  getKey: (event) => {
    const query = getQuery(event)
    return `stories-${query.category || 'all'}-${query.page || 1}-${query.limit || 20}-${query.featured || false}`
  }
})
