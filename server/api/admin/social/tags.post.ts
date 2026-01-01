import { requireAdminAuth } from '~/server/utils/admin-auth'
import { generateViralHashtags, generateTwitterHashtags } from '~/server/utils/social-tags'

export default defineEventHandler(async (event) => {
    await requireAdminAuth(event)

    const body = await readBody(event)
    const { article } = body

    if (!article) {
        throw createError({
            statusCode: 400,
            message: 'Article data required'
        })
    }

    return {
        instagram: generateViralHashtags(article),
        twitter: generateTwitterHashtags(article)
    }
})
