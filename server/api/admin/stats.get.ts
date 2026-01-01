import { getStoriesCollection } from '~/server/utils/db'
import { requireAdminAuth } from '~/server/utils/admin-auth'
import { newsSources } from '~/server/utils/sources'

export default defineEventHandler(async (event) => {
  requireAdminAuth(event)
  
  const stories = await getStoriesCollection()
  
  // Total articles
  const totalArticles = await stories.countDocuments()
  
  // This week (by publishedAt since createdAt may not exist on older articles)
  const weekAgo = new Date()
  weekAgo.setDate(weekAgo.getDate() - 7)
  const thisWeek = await stories.countDocuments({
    publishedAt: { $gte: weekAgo }
  })
  
  // By category
  const byCategory = await stories.aggregate([
    { $group: { _id: '$category', count: { $sum: 1 } } }
  ]).toArray()
  
  // Count all unique sources with articles
  const allSources = await stories.aggregate([
    { $group: { _id: '$originalSource', count: { $sum: 1 } } },
    { $sort: { count: -1 } }
  ]).toArray()
  
  // Top 10 for display
  const topSources = allSources.slice(0, 10)
  
  return {
    totalArticles,
    thisWeek,
    activeSources: allSources.length,  // All sources that have produced articles
    totalSources: newsSources.length,   // Total configured sources
    byCategory: byCategory.reduce((acc, item) => {
      acc[item._id] = item.count
      return acc
    }, {} as Record<string, number>),
    topSources: topSources.map(s => ({ name: s._id, count: s.count })),
  }
})
