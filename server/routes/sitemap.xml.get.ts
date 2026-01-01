import { getStoriesCollection } from '~/server/utils/db'

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const siteUrl = config.public.siteUrl || 'https://brightwire.news'
  
  try {
    const stories = await getStoriesCollection()
    
    // Get all articles
    const articles = await stories
      .find({})
      .sort({ publishedAt: -1 })
      .project({ slug: 1, publishedAt: 1, category: 1 })
      .toArray()

    const today = new Date().toISOString().split('T')[0]

    // Static pages
    const staticPages = [
      { url: '/', changefreq: 'hourly', priority: '1.0' },
      { url: '/today', changefreq: 'hourly', priority: '0.9' },
      { url: '/search', changefreq: 'daily', priority: '0.6' },
      { url: '/category/good-news', changefreq: 'hourly', priority: '0.8' },
      { url: '/category/heroes', changefreq: 'hourly', priority: '0.8' },
      { url: '/category/planet', changefreq: 'hourly', priority: '0.8' },
      { url: '/category/innovation', changefreq: 'hourly', priority: '0.8' },
      { url: '/category/solutions', changefreq: 'hourly', priority: '0.8' },
      { url: '/category/kindness', changefreq: 'hourly', priority: '0.8' },
      { url: '/about', changefreq: 'monthly', priority: '0.5' },
      { url: '/contact', changefreq: 'monthly', priority: '0.5' },
      { url: '/submit', changefreq: 'monthly', priority: '0.5' },
      { url: '/privacy', changefreq: 'monthly', priority: '0.3' },
      { url: '/terms', changefreq: 'monthly', priority: '0.3' },
      { url: '/cookies', changefreq: 'monthly', priority: '0.3' },
    ]

    // Generate XML
    const staticXml = staticPages.map(page => `
  <url>
    <loc>${siteUrl}${page.url}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
  </url>`).join('')

    const articlesXml = articles.map(article => `
  <url>
    <loc>${siteUrl}/article/${article.slug}</loc>
    <lastmod>${new Date(article.publishedAt).toISOString().split('T')[0]}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
  </url>`).join('')

    const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:news="http://www.google.com/schemas/sitemap-news/0.9"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
${staticXml}
${articlesXml}
</urlset>`

    setHeader(event, 'Content-Type', 'application/xml; charset=utf-8')
    setHeader(event, 'Cache-Control', 'public, max-age=3600') // Cache for 1 hour
    
    return sitemap
  } catch (error) {
    console.error('Sitemap error:', error)
    throw createError({
      statusCode: 500,
      message: 'Failed to generate sitemap',
    })
  }
})
