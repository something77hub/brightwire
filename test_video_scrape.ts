import { scrapeArticle } from './server/utils/scraper'

async function test() {
    const videoUrl = 'https://www.youtube.com/watch?v=dQw4w9WgXcQ' // Generic example
    console.log(`Testing scrape for: ${videoUrl}`)

    try {
        // Mocking a short RSS summary fallback
        const result = await scrapeArticle(videoUrl, 'A short video summary.')
        console.log('Result:', result)
    } catch (e) {
        console.error('Scrape failed:', e)
    }
}

test()
