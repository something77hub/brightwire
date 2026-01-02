import { getStoriesCollection } from '~/server/utils/db'

export default defineEventHandler(async (event) => {
    const config = useRuntimeConfig()
    const siteUrl = config.public.siteUrl || 'https://brightwire.news'

    try {
        const stories = await getStoriesCollection()

        // Get articles from last 2 days (Google News requirement)
        const twoDaysAgo = new Date()
        twoDaysAgo.setDate(twoDaysAgo.getDate() - 2)

        const articles = await stories
            .find({
                publishedAt: { $gte: twoDaysAgo },
                category: { $exists: true }
            })
            .sort({ publishedAt: -1 })
            .limit(1000) // Google News limit
            .project({
                slug: 1,
                title: 1,
                publishedAt: 1,
                category: 1,
                tags: 1,
                author: 1
            })
            .toArray()

        // Generate Google News-specific XML
        const articlesXml = articles.map(article => {
            const pubDate = new Date(article.publishedAt).toISOString()
            const keywords = article.tags?.join(', ') || article.category

            return `
  <url>
    <loc>${siteUrl}/article/${article.slug}</loc>
    <news:news>
      <news:publication>
        <news:name>BrightWire</news:name>
        <news:language>en</news:language>
      </news:publication>
      <news:publication_date>${pubDate}</news:publication_date>
      <news:title>${escapeXml(article.title)}</news:title>
      <news:keywords>${keywords}</news:keywords>
    </news:news>
  </url>`
        }).join('')

        const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:news="http://www.google.com/schemas/sitemap-news/0.9">
${articlesXml}
</urlset>`

        setHeader(event, 'Content-Type', 'application/xml; charset=utf-8')
        setHeader(event, 'Cache-Control', 'public, max-age=600') // Cache for 10 mins (news is fresh)

        return sitemap
    } catch (error) {
        console.error('News sitemap error:', error)
        throw createError({
            statusCode: 500,
            message: 'Failed to generate news sitemap',
        })
    }
})

function escapeXml(str: string): string {
    return str
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&apos;')
}
