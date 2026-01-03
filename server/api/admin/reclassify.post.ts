import { MongoClient } from 'mongodb'
import Anthropic from '@anthropic-ai/sdk'
import { requireAdminAuth } from '~/server/utils/admin-auth'
import type { StoryCategory } from '~/types'

// Reclassify articles that are all in one category
export default defineEventHandler(async (event) => {
  await requireAdminAuth(event)

  const body = await readBody(event)
  const batchSize = body?.batchSize || 20 // How many to reclassify at once
  const dryRun = body?.dryRun !== false // Default to dry run for safety

  const config = useRuntimeConfig()
  const client = new MongoClient(config.mongodbUri)

  try {
    await client.connect()
    const db = client.db('brightwire')
    const stories = db.collection('stories')

    // Get articles that need reclassification
    // Prioritize those currently in 'good-news' since that's the fallback
    const candidates = await stories
      .find({ category: 'good-news' })
      .sort({ createdAt: -1 })
      .limit(batchSize)
      .project({ _id: 1, title: 1, summary: 1, category: 1 })
      .toArray()

    if (candidates.length === 0) {
      return {
        message: 'No articles to reclassify',
        reclassified: 0
      }
    }

    // Use Claude to reclassify
    const anthropic = new Anthropic({ apiKey: config.anthropicApiKey })

    const prompt = `You are a senior editor for BrightWire. Your job is to fix the categorization of these articles.

CRITICAL: We now have a "world" category for international news.
- If the article is about a specific country (not US/UK) or international relations, use "world".
- If it's about sports, use "sports".

CATEGORIES - Pick the MOST SPECIFIC one:
1. "heroes" (Volunteers, rescuers, community leaders)
2. "planet" (Environment, wildlife, climate, nature)
3. "innovation" (Tech, science, AI, space, medical breakthroughs)
4. "solutions" (Policy wins, social programs, systemic fixes)
5. "kindness" (Heartwarming moments, reunions, generosity)
6. "sports" (Athletes, matches, records, teams)
7. "world" (International news, specific countries, diplomacy)
8. "good-news" (General positive stories / Daily Mix)

IMPORTANT INSTRUCTIONS:
- Sports takes priority over Heroes (e.g. Messi saving a game is Sports)
- World takes priority if the location is the main context (e.g. "Nigeria launches new health program" -> World, not Solutions)

Headlines to reclassify:
${candidates.map((c, i) => `${i + 1}. ${c.title}\n   Summary: ${c.summary}`).join('\n')}

Respond with JSON array ONLY:
[{"idx": 1, "category": "heroes"}, ...]`

    const response = await anthropic.messages.create({
      model: 'claude-3-5-haiku-20241022',
      max_tokens: 4000,
      messages: [{ role: 'user', content: prompt }],
    })

    const text = response.content[0].type === 'text' ? response.content[0].text : ''
    const jsonMatch = text.match(/\[[\s\S]*\]/)

    if (!jsonMatch) {
      return { error: 'Failed to parse AI response', raw: text }
    }

    const results = JSON.parse(jsonMatch[0])

    const categoryMap: Record<string, StoryCategory> = {
      'good-news': 'good-news',
      'heroes': 'heroes',
      'planet': 'planet',
      'innovation': 'innovation',
      'solutions': 'solutions',
      'kindness': 'kindness',
      'sports': 'sports',
      'world': 'world',
    }

    const updates: { id: string; oldCategory: string; newCategory: string; title: string }[] = []

    for (const result of results) {
      const candidate = candidates[result.idx - 1]
      if (!candidate) continue

      const newCategory = categoryMap[result.category?.toLowerCase()] || 'good-news'

      if (newCategory !== candidate.category) {
        updates.push({
          id: candidate._id.toString(),
          title: candidate.title.substring(0, 50) + '...',
          oldCategory: candidate.category,
          newCategory,
        })

        if (!dryRun) {
          await stories.updateOne(
            { _id: candidate._id },
            { $set: { category: newCategory, updatedAt: new Date() } }
          )
        }
      }
    }

    return {
      dryRun,
      message: dryRun
        ? `Would reclassify ${updates.length} articles. Set dryRun: false to apply.`
        : `Reclassified ${updates.length} articles`,
      total: candidates.length,
      changed: updates.length,
      unchanged: candidates.length - updates.length,
      updates,
    }
  } catch (error) {
    console.error('Reclassification error:', error)
    throw createError({
      statusCode: 500,
      message: 'Failed to reclassify articles'
    })
  } finally {
    await client.close()
  }
})
