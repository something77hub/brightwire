export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const siteUrl = config.public.siteUrl || 'https://brightwire.news'

  const robotsTxt = `# BrightWire Robots.txt
# ${siteUrl}

User-agent: *
Allow: /

# Sitemaps
Sitemap: ${siteUrl}/sitemap.xml
Sitemap: ${siteUrl}/news-sitemap.xml

# Disallow admin pages
Disallow: /admin
Disallow: /admin/

# Allow search engines to crawl everything else
Allow: /article/
Allow: /category/
Allow: /feed.xml
`

  setHeader(event, 'Content-Type', 'text/plain; charset=utf-8')
  setHeader(event, 'Cache-Control', 'public, max-age=86400') // Cache for 24 hours

  return robotsTxt
})
