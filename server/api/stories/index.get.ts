import { getStoriesCollection } from '~/server/utils/db'
import type { Story, StoryCategory } from '~/types'

export default defineEventHandler(async (event) => {
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
      // Target Mix: 10% Sports, 20% Health, 70% General (Core)
      const sportsLimit = Math.ceil(limit * 0.10)  // ~1-2 items per 20
      const healthLimit = Math.ceil(limit * 0.20)  // ~4 items per 20
      const coreLimit = limit - sportsLimit - healthLimit // Remaining ~70%

      const sportsSkip = (page - 1) * sportsLimit
      const healthSkip = (page - 1) * healthLimit
      const coreSkip = (page - 1) * coreLimit

      const aggregation = [
        {
          $facet: {
            // Stream 1: Sports (10%)
            sports: [
              { $match: { ...filter, category: 'sports' } },
              { $sort: { createdAt: -1 } },
              { $skip: sportsSkip },
              { $limit: sportsLimit }
            ],
            // Stream 2: Health (20%)
            health: [
              { $match: { ...filter, category: 'health' } },
              { $sort: { createdAt: -1 } },
              { $skip: healthSkip },
              { $limit: healthLimit }
            ],
            // Stream 3: General/Core (70%) - Exclude Sports & Health
            core: [
              { $match: { ...filter, category: { $nin: ['sports', 'health'] } } },
              { $sort: { createdAt: -1 } },
              { $skip: coreSkip },
              { $limit: coreLimit }
            ]
          }
        }
      ]

      const [faceted] = await stories.aggregate(aggregation).toArray()

      // Merge and sort by date to interleave them naturally
      // We start with Core as base, then inject Sports and Health at intervals if we wanted strictly ordered,
      // but sorting by date is usually best for a natural "Newest" feel while respecting the quantity caps.
      // However, if we just sort by date, a recent burst of sports might clump at top if they are newer. 
      // But since we LIMITED the number of sports items returned, they can't dominate the whole list.
      // They will just be the *newest* 2 sports items.
      results = [
        ...(faceted.sports || []),
        ...(faceted.health || []),
        ...(faceted.core || [])
      ].sort((a, b) => {
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
})
