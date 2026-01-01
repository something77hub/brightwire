import { ObjectId } from 'mongodb'
import { getStoriesCollection } from '~/server/utils/db'

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')

  if (!id) {
    throw createError({
      statusCode: 400,
      message: 'Story ID or slug is required',
    })
  }

  try {
    const stories = await getStoriesCollection()
    
    let story
    
    // Try to find by slug first (most common for article pages)
    story = await stories.findOne({ slug: id })
    
    // If not found, try by MongoDB ObjectId
    if (!story && ObjectId.isValid(id)) {
      story = await stories.findOne({ _id: new ObjectId(id) })
    }
    
    // If still not found, try by guid
    if (!story) {
      story = await stories.findOne({ guid: id })
    }

    if (!story) {
      throw createError({
        statusCode: 404,
        message: 'Story not found',
      })
    }

    const relatedStories: any[] = []
    const usedIds = new Set([story._id.toString()])
    const storyTags = story.tags || []

    // Priority 1: Same category + matching tags (best relevance)
    if (storyTags.length > 0) {
      const sameCategoryWithTags = await stories
        .find({
          _id: { $ne: story._id },
          category: story.category,
          tags: { $in: storyTags },
        })
        .sort({ publishedAt: -1 })
        .limit(3)
        .project({
          slug: 1,
          title: 1,
          summary: 1,
          imageUrl: 1,
          category: 1,
          readTime: 1,
          publishedAt: 1,
          tags: 1,
        })
        .toArray()

      for (const s of sameCategoryWithTags) {
        if (relatedStories.length < 3 && !usedIds.has(s._id.toString())) {
          relatedStories.push(s)
          usedIds.add(s._id.toString())
        }
      }
    }

    // Priority 2: Same category (no tag match required)
    if (relatedStories.length < 3) {
      const sameCategory = await stories
        .find({
          _id: { $nin: Array.from(usedIds).map(id => new ObjectId(id)) },
          category: story.category,
        })
        .sort({ publishedAt: -1 })
        .limit(3 - relatedStories.length)
        .project({
          slug: 1,
          title: 1,
          summary: 1,
          imageUrl: 1,
          category: 1,
          readTime: 1,
          publishedAt: 1,
          tags: 1,
        })
        .toArray()

      for (const s of sameCategory) {
        if (relatedStories.length < 3 && !usedIds.has(s._id.toString())) {
          relatedStories.push(s)
          usedIds.add(s._id.toString())
        }
      }
    }

    // Priority 3: Different category but matching tags
    if (relatedStories.length < 3 && storyTags.length > 0) {
      const differentCategoryWithTags = await stories
        .find({
          _id: { $nin: Array.from(usedIds).map(id => new ObjectId(id)) },
          category: { $ne: story.category },
          tags: { $in: storyTags },
        })
        .sort({ publishedAt: -1 })
        .limit(3 - relatedStories.length)
        .project({
          slug: 1,
          title: 1,
          summary: 1,
          imageUrl: 1,
          category: 1,
          readTime: 1,
          publishedAt: 1,
          tags: 1,
        })
        .toArray()

      for (const s of differentCategoryWithTags) {
        if (relatedStories.length < 3 && !usedIds.has(s._id.toString())) {
          relatedStories.push(s)
          usedIds.add(s._id.toString())
        }
      }
    }

    // Priority 4: Fallback - high scoring recent stories
    if (relatedStories.length < 3) {
      const fallbackStories = await stories
        .find({
          _id: { $nin: Array.from(usedIds).map(id => new ObjectId(id)) },
        })
        .sort({ score: -1, publishedAt: -1 })
        .limit(3 - relatedStories.length)
        .project({
          slug: 1,
          title: 1,
          summary: 1,
          imageUrl: 1,
          category: 1,
          readTime: 1,
          publishedAt: 1,
          tags: 1,
        })
        .toArray()

      for (const s of fallbackStories) {
        if (relatedStories.length < 3 && !usedIds.has(s._id.toString())) {
          relatedStories.push(s)
          usedIds.add(s._id.toString())
        }
      }
    }

    return {
      story,
      related: relatedStories,
    }
  } catch (error: any) {
    if (error.statusCode) throw error
    
    console.error('Error fetching story:', error)
    throw createError({
      statusCode: 500,
      message: 'Failed to fetch story',
    })
  }
})
