import Parser from 'rss-parser'

const parser = new Parser({ timeout: 10000 })

const testFeeds = [
  { name: 'BBC', url: 'https://feeds.bbci.co.uk/news/rss.xml' },
  { name: 'NPR', url: 'https://feeds.npr.org/1001/rss.xml' },
  { name: 'Reuters', url: 'https://www.rss.reuters.com/news/topNews' },
  { name: 'AP', url: 'https://rsshub.app/apnews/topics/apf-topnews' },
]

async function test() {
  for (const feed of testFeeds) {
    try {
      console.log(`\n=== ${feed.name} ===`)
      const data = await parser.parseURL(feed.url)
      const items = data.items.slice(0, 3)
      for (const item of items) {
        const pubDate = item.pubDate || item.isoDate || 'NO DATE'
        console.log(`  ${pubDate} - ${item.title?.substring(0, 50)}...`)
      }
    } catch (e: any) {
      console.log(`  ERROR: ${e.message}`)
    }
  }
}

test()
