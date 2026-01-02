import { MongoClient } from 'mongodb'

const MONGODB_URI = process.env.MONGODB_URI || 'your-mongodb-uri'

async function analyzeDatabase() {
    const client = new MongoClient(MONGODB_URI)

    try {
        await client.connect()
        console.log('Connected to MongoDB\n')

        const db = client.db('brightwire')

        // Get all collections
        const collections = await db.listCollections().toArray()

        console.log('📊 Collection Sizes:\n')
        console.log('═'.repeat(60))

        let totalSize = 0

        for (const coll of collections) {
            const stats = await db.command({ collStats: coll.name })
            const sizeMB = (stats.size / 1024 / 1024).toFixed(2)
            const count = stats.count
            const avgDocSize = stats.count > 0 ? (stats.avgObjSize / 1024).toFixed(2) : '0'

            console.log(`${coll.name}:`)
            console.log(`  Size: ${sizeMB} MB`)
            console.log(`  Documents: ${count}`)
            console.log(`  Avg doc size: ${avgDocSize} KB`)
            console.log('─'.repeat(60))

            totalSize += stats.size
        }

        console.log(`\nTOTAL: ${(totalSize / 1024 / 1024).toFixed(2)} MB\n`)

        // Analyze stories collection specifically
        console.log('\n📰 Stories Collection Deep Dive:\n')
        console.log('═'.repeat(60))

        const stories = db.collection('stories')

        // Sample a few large documents
        const largeDocs = await stories
            .find({})
            .sort({ _id: -1 })
            .limit(5)
            .toArray()

        if (largeDocs.length > 0) {
            console.log('Sample article sizes:')
            largeDocs.forEach((doc, i) => {
                const docSize = JSON.stringify(doc).length
                const contentSize = doc.content?.length || 0
                const imagesSize = JSON.stringify(doc.images || []).length

                console.log(`\nArticle ${i + 1}: "${doc.title?.substring(0, 50)}..."`)
                console.log(`  Total doc size: ${(docSize / 1024).toFixed(2)} KB`)
                console.log(`  Content field: ${(contentSize / 1024).toFixed(2)} KB`)
                console.log(`  Images field: ${(imagesSize / 1024).toFixed(2)} KB`)
                console.log(`  Num images: ${doc.images?.length || 0}`)
            })
        }

        // Check for issues
        console.log('\n\n⚠️  Potential Issues:\n')
        console.log('═'.repeat(60))

        const queueStats = await db.command({ collStats: 'article_queue' }).catch(() => null)
        if (queueStats && queueStats.count > 100) {
            console.log(`❌ Queue has ${queueStats.count} pending items (should be <50)`)
        }

        const storiesCount = await stories.countDocuments({})
        const avgSize = totalSize / storiesCount / 1024
        if (avgSize > 50) {
            console.log(`❌ Average article size is ${avgSize.toFixed(2)} KB (should be <50 KB)`)
            console.log('   → Likely storing base64 images or uncompressed HTML')
        }

        // Check for duplicates
        const duplicateCheck = await stories.aggregate([
            { $group: { _id: '$guid', count: { $sum: 1 } } },
            { $match: { count: { $gt: 1 } } }
        ]).toArray()

        if (duplicateCheck.length > 0) {
            console.log(`❌ Found ${duplicateCheck.length} duplicate articles (same GUID)`)
        }

        console.log('\n\n💡 Recommended Actions:\n')
        console.log('═'.repeat(60))
        console.log('1. Delete old articles (>6 months)')
        console.log('2. Clear article queue')
        console.log('3. Remove duplicate articles')
        console.log('4. Verify images are Cloudinary URLs (not base64)')
        console.log('\n')

    } catch (error) {
        console.error('Error:', error)
    } finally {
        await client.close()
    }
}

analyzeDatabase()
