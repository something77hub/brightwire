import { requireAdminAuth } from '~/server/utils/admin-auth'
import { mailerliteFetch } from '~/server/utils/mailerlite'

export default defineEventHandler(async (event) => {
  requireAdminAuth(event)
  
  const query = getQuery(event)
  const cursor = query.cursor as string || ''
  const limit = parseInt(query.limit as string) || 50
  const search = (query.search as string) || ''
  
  if (!process.env.MAILERLITE_API_KEY) {
    throw createError({
      statusCode: 400,
      message: 'MailerLite API key not configured'
    })
  }
  
  try {
    // Fetch total count on first page (no cursor)
    let total = 0
    if (!cursor) {
      try {
        const countResponse = await mailerliteFetch(
          'https://connect.mailerlite.com/api/subscribers?limit=0'
        )
        if (countResponse.ok) {
          const countData = await countResponse.json()
          // Handle both { total: X } and { data: [], meta: { total: X } } formats
          total = countData.total ?? countData.meta?.total ?? 0
          console.log('[MailerLite] Total subscribers:', total)
        }
      } catch (e) {
        console.error('[MailerLite] Failed to fetch total:', e)
      }
    }
    
    // Fetch subscribers
    let url = `https://connect.mailerlite.com/api/subscribers?limit=${limit}`
    
    if (cursor) {
      url += `&cursor=${encodeURIComponent(cursor)}`
    }
    
    if (search) {
      url += `&filter[email]=${encodeURIComponent(search)}`
    }
    
    const response = await mailerliteFetch(url)
    
    if (!response.ok) {
      const error = await response.json().catch(() => ({}))
      throw new Error(error.message || `MailerLite API error: ${response.status}`)
    }
    
    const data = await response.json()
    
    // Extract cursors from links for pagination
    const links = data.links || {}
    let nextCursor = null
    let prevCursor = null
    
    try {
      if (links.next) nextCursor = new URL(links.next).searchParams.get('cursor')
      if (links.prev) prevCursor = new URL(links.prev).searchParams.get('cursor')
    } catch (e) {
      // Ignore URL parsing errors
    }
    
    return {
      subscribers: data.data || [],
      meta: {
        ...data.meta,
        total: total || data.meta?.total || 0,
        per_page: limit,
      },
      pagination: {
        hasNext: !!links.next,
        hasPrev: !!links.prev,
        nextCursor,
        prevCursor,
      },
      links: data.links || {},
    }
  } catch (error: any) {
    if (error.statusCode) throw error
    
    console.error('Failed to fetch subscribers:', error)
    throw createError({
      statusCode: 500,
      message: error.message || 'Failed to fetch subscribers'
    })
  }
})
