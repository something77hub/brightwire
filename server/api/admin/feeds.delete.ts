
import { MongoClient, ObjectId } from 'mongodb'
import { requireAdminAuth } from '~/server/utils/admin-auth'

export default defineEventHandler(async (event) => {
    await requireAdminAuth(event)

    const { id } = getQuery(event)
    if (!id) throw createError({ statusCode: 400, message: 'ID required' })

    const config = useRuntimeConfig()
    const client = new MongoClient(config.mongodbUri)

    try {
        await client.connect()
        const db = client.db('brightwire')
        const feeds = db.collection('feeds')

        await feeds.deleteOne({ _id: new ObjectId(String(id)) })

        return { success: true, message: 'Feed deleted' }
    } catch (e: any) {
        throw createError({ statusCode: 500, message: e.message })
    } finally {
        await client.close()
    }
})
