import Pusher from 'pusher-js'

export default defineNuxtPlugin(() => {
  const config = useRuntimeConfig()
  
  // Don't initialize if no key
  if (!config.public.pusherKey) {
    return {
      provide: {
        pusher: null,
      },
    }
  }

  const pusher = new Pusher(config.public.pusherKey, {
    cluster: config.public.pusherCluster || 'us2',
  })

  return {
    provide: {
      pusher,
    },
  }
})
