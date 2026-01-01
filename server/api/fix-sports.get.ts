import { getStoriesCollection } from '~/server/utils/db'

export default defineEventHandler(async (event) => {
    try {
        const stories = await getStoriesCollection()

        const sportsKeywords = [
            'nba', 'nfl', 'nhl', 'mlb', 'football', 'soccer', 'basketball',
            'baseball', 'hockey', 'tennis', 'golf', 'olympics', 'championship',
            'tournament', 'athlete', 'stadium', 'team', 'coach', 'quarterback',
            'touchdown', 'goal', 'score', 'match', 'racing', 'f1', 'formula 1',
            'lebron', 'curry', 'mahomes', 'messi', 'ronaldo', 'serena', 'tiger woods'
        ]

        // Find 'good-news' items that might be sports
        const candidates = await stories.find({
            category: 'good-news',
            $or: [
                { title: { $regex: new RegExp(sportsKeywords.join('|'), 'i') } },
                { summary: { $regex: new RegExp(sportsKeywords.join('|'), 'i') } },
                { tags: { $in: sportsKeywords.map(k => new RegExp(k, 'i')) } }
            ]
        }).toArray()

        const updates = []

        for (const story of candidates) {
            if (story._id) {
                updates.push({
                    updateOne: {
                        filter: { _id: story._id },
                        update: { $set: { category: 'sports' } }
                    }
                })
            }
        }

        let result = { matched: 0, modified: 0 }
        if (updates.length > 0) {
            result = await stories.bulkWrite(updates)
        }

        return {
            success: true,
            found: candidates.length,
            updated: result.modifiedCount,
            titles: candidates.map(c => c.title)
        }
    } catch (e) {
        return { error: e.message }
    }
})
