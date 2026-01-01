/// <reference types="node" />
import Pusher from 'pusher'

let pusherInstance: Pusher | null = null

export function getPusher(): Pusher | null {
  // Return null if Pusher is not configured
  if (!process.env.PUSHER_APP_ID || !process.env.PUSHER_KEY || !process.env.PUSHER_SECRET) {
    return null
  }

  if (!pusherInstance) {
    pusherInstance = new Pusher({
      appId: process.env.PUSHER_APP_ID,
      key: process.env.PUSHER_KEY,
      secret: process.env.PUSHER_SECRET,
      cluster: process.env.PUSHER_CLUSTER || 'us2',
      useTLS: true,
    })
  }

  return pusherInstance
}

// Trigger new articles event
export async function notifyNewArticles(count: number, articles: Array<{ title: string; category: string }>) {
  const pusher = getPusher()
  if (!pusher) {
    console.log('[Pusher] Not configured, skipping notification')
    return
  }

  try {
    await pusher.trigger('brightwire', 'new-articles', {
      count,
      articles: articles.slice(0, 5), // Send first 5 article previews
      timestamp: new Date().toISOString(),
    })
    console.log(`[Pusher] Notified: ${count} new articles`)
  } catch (error) {
    console.error('[Pusher] Failed to notify:', error)
  }
}
