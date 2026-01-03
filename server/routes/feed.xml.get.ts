import { getStoriesCollection } from '~/server/utils/db'

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const siteUrl = config.public.siteUrl || 'https://brightwire.news'

  try {
    const stories = await getStoriesCollection()

    // Get latest 20 articles
    const articles = await stories
      .find({})
      .sort({ publishedAt: -1 })
      .limit(20)
      .toArray()

    const formatDate = (date: Date) => {
      return new Date(date).toUTCString()
    }

    const escapeXml = (str: string) => {
      return str
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&apos;')
    }

    const getCategoryLabel = (category: string) => {
      const labels: Record<string, string> = {
        'good-news': 'Daily Mix',
        'heroes': 'Community Heroes',
        'planet': 'Planet Wins',
        'innovation': 'Innovation',
        'solutions': 'Solutions',
      }
      return labels[category] || 'Good News'
    }

    const items = articles.map(article => `
    <item>
      <title>${escapeXml(article.title)}</title>
      <link>${siteUrl}/article/${article.slug}</link>
      <guid isPermaLink="true">${siteUrl}/article/${article.slug}</guid>
      <description><![CDATA[${article.summary}]]></description>
      <content:encoded><![CDATA[${article.content.replace(/\[P\]/g, '</p><p>')}]]></content:encoded>
      <pubDate>${formatDate(article.publishedAt)}</pubDate>
      <category>${getCategoryLabel(article.category)}</category>
      ${article.imageUrl ? `<media:content url="${escapeXml(article.imageUrl)}" medium="image" />` : ''}
      ${article.imageUrl ? `<enclosure url="${escapeXml(article.imageUrl)}" type="image/jpeg" />` : ''}
      <author>hello@brightwire.news (BrightWire Staff)</author>
    </item>`).join('\n')

    const rss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" 
  xmlns:content="http://purl.org/rss/1.0/modules/content/"
  xmlns:media="http://search.yahoo.com/mrss/"
  xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>BrightWire - Good News Daily</title>
    <link>${siteUrl}</link>
    <description>Your daily dose of positive, uplifting news stories from around the world. Because good news matters.</description>
    <language>en-us</language>
    <lastBuildDate>${formatDate(new Date())}</lastBuildDate>
    <atom:link href="${siteUrl}/feed.xml" rel="self" type="application/rss+xml"/>
    <image>
      <url>${siteUrl}/favicon.svg</url>
      <title>BrightWire</title>
      <link>${siteUrl}</link>
    </image>
    <copyright>© ${new Date().getFullYear()} BrightWire. All rights reserved.</copyright>
    <managingEditor>hello@brightwire.news (BrightWire)</managingEditor>
    <webMaster>hello@brightwire.news (BrightWire)</webMaster>
    <ttl>60</ttl>
    ${items}
  </channel>
</rss>`

    // Set proper headers for RSS
    setHeader(event, 'Content-Type', 'application/rss+xml; charset=utf-8')
    setHeader(event, 'Cache-Control', 'public, max-age=3600') // Cache for 1 hour

    return rss
  } catch (error) {
    console.error('RSS feed error:', error)
    throw createError({
      statusCode: 500,
      message: 'Failed to generate RSS feed',
    })
  }
})
