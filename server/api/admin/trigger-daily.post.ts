import { inngest } from '~/server/inngest/client'
import { requireAdminAuth } from '~/server/utils/admin-auth'

export default defineEventHandler(async (event) => {
    requireAdminAuth(event)

    try {
        // Send event to trigger the daily content generation
        await inngest.send({
            name: 'app/manual.daily-content',
            data: {
                triggeredAt: new Date().toISOString(),
                manual: true,
            },
        })

        return { success: true, message: 'Daily content generation started' }
    } catch (e: any) {
        throw createError({
            statusCode: 500,
            message: `Failed to trigger generation: ${e.message}`,
        })
    }
})
