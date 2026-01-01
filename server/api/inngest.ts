import { serve } from 'inngest/nuxt'
import { inngest } from '~/server/inngest/client'
import { fetchNews } from '~/server/inngest/functions'

export default serve({
  client: inngest,
  functions: [fetchNews],
})
