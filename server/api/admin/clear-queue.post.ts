
import { MongoClient } from 'mongodb'

export default defineEventHandler(async (event) => {
    const config = useRuntimeConfig()
    const client = new MongoClient(config.mongodbUri)

    try {
        await client.connect()
        const db = client.db('brightwire')
        const queue = db.collection('article_queue')

        const result = await queue.deleteMany({}) // Clear everything pending

        return {
            success: true,
            deleted: result.deletedCount,
            message: `Cleared ${result.deletedCount} items from the queue.`
        }
    } catch (e: any) {
        return { error: e.message }
    } finally {
        await client.close()
    }
})
