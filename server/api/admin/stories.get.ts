
import { getStoriesCollection } from '~/server/utils/db'
import { requireAdminAuth } from '~/server/utils/admin-auth'

export default defineEventHandler(async (event) => {
    await requireAdminAuth(event)

    const query = getQuery(event)
    const limit = Math.min(Number(query.limit) || 100, 2000) // Allow up to 2000
    const category = query.category as string

    const stories = await getStoriesCollection()

    // Build filter
    const filter: Record<string, any> = {}
    if (category && category !== 'all') {
        filter.category = category
    }

    // Fetch lightweight projection for list view
    const results = await stories
        .find(filter)
        .project({
            title: 1,
            summary: 1,
            category: 1,
            publishedAt: 1,
            createdAt: 1,
            _id: 1
        })
        .sort({ createdAt: -1 })
        .limit(limit)
        .toArray()

    return {
        stories: results,
        count: results.length
    }
})
