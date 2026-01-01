import { inngest } from '~/server/inngest/client'
import { requireAdminAuth } from '~/server/utils/admin-auth'

export default defineEventHandler(async (event) => {
  requireAdminAuth(event)
  
  try {
    // Send event to trigger the fetch-news function
    await inngest.send({
      name: 'app/manual.fetch',
      data: {
        triggeredAt: new Date().toISOString(),
        manual: true,
      },
    })
    
    return { success: true, message: 'Fetch triggered' }
  } catch (e: any) {
    throw createError({
      statusCode: 500,
      message: `Failed to trigger fetch: ${e.message}`,
    })
  }
})
