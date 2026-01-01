
import { MongoClient } from 'mongodb'
import { newsSources } from '~/server/utils/sources'
import { requireAdminAuth } from '~/server/utils/admin-auth'

export default defineEventHandler(async (event) => {
    await requireAdminAuth(event)

    const config = useRuntimeConfig()
    const client = new MongoClient(config.mongodbUri)

    try {
        await client.connect()
        const db = client.db('brightwire')
        const feeds = db.collection('feeds')

        // Check if we have any feeds
        const count = await feeds.countDocuments()

        if (count === 0) {
            // Seed with default sources
            console.log('Seeding feeds from default list...')
            await feeds.insertMany(newsSources.map(s => ({
                ...s,
                enabled: true,
                createdAt: new Date(),
                updatedAt: new Date()
            })))
        }

        // Fetch all feeds
        const allFeeds = await feeds.find({}).sort({ name: 1 }).toArray()

        return {
            feeds: allFeeds
        }
    } catch (e: any) {
        throw createError({
            statusCode: 500,
            message: 'Failed to fetch feeds: ' + e.message
        })
    } finally {
        await client.close()
    }
})
