import type { Ref } from 'vue'

interface NewArticlesData {
  count: number
  articles: Array<{ title: string; category: string }>
  timestamp: string
}

export function usePusherUpdates(onNewArticles?: (data: NewArticlesData) => void) {
  const { $pusher } = useNuxtApp()

  // Use global state so it's shared across all components/pages
  const newArticlesCount = useState<number>('pusher-new-articles-count', () => 0)
  const showNewArticlesBanner = useState<boolean>('pusher-show-banner', () => false)
  const isSubscribed = useState<boolean>('pusher-is-subscribed', () => false)

  let channel: any = null

  const subscribe = () => {
    if (!$pusher) {
      console.log('[Pusher] Not configured')
      return false
    }

    // specific callback for this instance
    if (onNewArticles && channel) {
      channel.bind('new-articles', onNewArticles)
    }

    // Only subscribe once globally
    if (isSubscribed.value) return true

    channel = $pusher.subscribe('brightwire')
    channel.bind('new-articles', (data: NewArticlesData) => {
      console.log('[Pusher] New articles:', data)
      newArticlesCount.value = data.count
      showNewArticlesBanner.value = true

      // If a callback was passed (legacy support), call it
      if (onNewArticles) {
        onNewArticles(data)
      }
    })

    console.log('[Pusher] Subscribed to brightwire channel')
    isSubscribed.value = true
    return true
  }

  const unsubscribe = () => {
    // We don't want to unsubscribe globally usually, 
    // but if we did:
    /*
    if (channel) {
      channel.unbind_all()
      channel.unsubscribe()
      channel = null
      isSubscribed.value = false
    }
    */
  }

  const dismissBanner = () => {
    showNewArticlesBanner.value = false
    newArticlesCount.value = 0
  }

  return {
    newArticlesCount,
    showNewArticlesBanner,
    dismissBanner,
    subscribe,
    unsubscribe,
    isConnected: computed(() => !!$pusher),
  }
}
