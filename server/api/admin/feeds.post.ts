
import { MongoClient, ObjectId } from 'mongodb'
import { requireAdminAuth } from '~/server/utils/admin-auth'

export default defineEventHandler(async (event) => {
    await requireAdminAuth(event)

    const body = await readBody(event)
    const { name, feed, baseUrl, category, enabled, _id } = body

    if (!name || !feed) {
        throw createError({ statusCode: 400, message: 'Name and Feed URL are required' })
    }

    const config = useRuntimeConfig()
    const client = new MongoClient(config.mongodbUri)

    try {
        await client.connect()
        const db = client.db('brightwire')
        const feeds = db.collection('feeds')

        if (_id) {
            // Update existing
            await feeds.updateOne(
                { _id: new ObjectId(_id) },
                {
                    $set: {
                        name,
                        feed,
                        baseUrl,
                        category,
                        enabled: enabled !== false,
                        updatedAt: new Date()
                    }
                }
            )
            return { success: true, message: 'Feed updated' }
        } else {
            // Create new
            await feeds.insertOne({
                name,
                feed,
                baseUrl,
                category,
                enabled: enabled !== false,
                createdAt: new Date(),
                updatedAt: new Date()
            })
            return { success: true, message: 'Feed added' }
        }
    } catch (e: any) {
        throw createError({ statusCode: 500, message: e.message })
    } finally {
        await client.close()
    }
})
