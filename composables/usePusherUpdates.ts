import type { Ref } from 'vue'

interface NewArticlesData {
  count: number
  articles: Array<{ title: string; category: string }>
  timestamp: string
}

export function usePusherUpdates(onNewArticles?: (data: NewArticlesData) => void) {
  const { $pusher } = useNuxtApp()
  const newArticlesCount = ref(0)
  const showNewArticlesBanner = ref(false)
  
  let channel: any = null

  const subscribe = () => {
    if (!$pusher) {
      console.log('[Pusher] Not configured')
      return false
    }

    channel = $pusher.subscribe('brightwire')
    channel.bind('new-articles', (data: NewArticlesData) => {
      console.log('[Pusher] New articles:', data)
      newArticlesCount.value = data.count
      showNewArticlesBanner.value = true
      
      if (onNewArticles) {
        onNewArticles(data)
      }
    })
    
    console.log('[Pusher] Subscribed to brightwire channel')
    return true
  }

  const unsubscribe = () => {
    if (channel) {
      channel.unbind_all()
      channel.unsubscribe()
      channel = null
    }
  }

  const dismissBanner = () => {
    showNewArticlesBanner.value = false
    newArticlesCount.value = 0
  }

  // Auto-subscribe on mount, unsubscribe on unmount
  onMounted(() => {
    subscribe()
  })

  onUnmounted(() => {
    unsubscribe()
  })

  return {
    newArticlesCount,
    showNewArticlesBanner,
    dismissBanner,
    subscribe,
    unsubscribe,
    isConnected: computed(() => !!$pusher),
  }
}
