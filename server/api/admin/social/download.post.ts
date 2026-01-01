import { requireAdminAuth } from '~/server/utils/admin-auth'
import { getStoriesCollection } from '~/server/utils/db'
import { ObjectId } from 'mongodb'
import JSZip from 'jszip'
import sharp from 'sharp'

import { generateViralHashtags } from '~/server/utils/social-tags'

// Social media image sizes
const SOCIAL_SIZES = {
  'twitter_facebook': { width: 1200, height: 630, name: 'twitter_facebook_1200x630' },
  'instagram_square': { width: 1080, height: 1080, name: 'instagram_square_1080x1080' },
  'instagram_portrait': { width: 1080, height: 1350, name: 'instagram_portrait_1080x1350' },
  'instagram_story': { width: 1080, height: 1920, name: 'instagram_story_1080x1920' },
  'linkedin': { width: 1200, height: 627, name: 'linkedin_1200x627' },
}

// Download selected articles as social media package with resized images
export default defineEventHandler(async (event) => {
  await requireAdminAuth(event)

  const body = await readBody(event)
  const { articleIds } = body

  if (!articleIds || articleIds.length === 0) {
    throw createError({
      statusCode: 400,
      message: 'No articles selected'
    })
  }

  try {
    const stories = await getStoriesCollection()

    // Get selected articles
    const objectIds = articleIds.map((id: string) => new ObjectId(id))
    const articles = await stories.find({ _id: { $in: objectIds } }).toArray()

    if (articles.length === 0) {
      throw createError({
        statusCode: 404,
        message: 'No articles found'
      })
    }

    const siteUrl = 'https://www.brightwire.news'
    const zip = new JSZip()

    // Process each article
    for (let i = 0; i < articles.length; i++) {
      const article = articles[i]
      const folderName = `${String(i + 1).padStart(2, '0')}_${article.slug.slice(0, 30)}`
      const folder = zip.folder(folderName)

      if (!folder) continue

      // Generate caption - Title first
      const title = article.title || ''
      const summary = article.summary || ''
      const truncatedSummary = summary.length > 200 ? summary.slice(0, 200) + '...' : summary

      // Generate viral hashtags using shared logic
      const hashtags = generateViralHashtags(article)

      const articleUrl = `${siteUrl}/article/${article.slug}`

      // Create caption file - Title first!
      const caption = `📰 ${title}

${truncatedSummary}

${hashtags}

🔗 Read more: ${articleUrl}`

      folder.file('caption.txt', caption)

      // Create full details file
      const details = `TITLE: ${article.title}

CAPTION (copy this):
${caption}

HASHTAGS ONLY:
${hashtags}

LINK:
${articleUrl}

CATEGORY: ${article.category}

IMAGES INCLUDED:
- twitter_facebook_1200x630.jpg  → Twitter, Facebook, Open Graph
- instagram_square_1080x1080.jpg → Instagram Feed (square)
- instagram_portrait_1080x1350.jpg → Instagram Feed (portrait)
- instagram_story_1080x1920.jpg  → Instagram/Facebook Stories
- linkedin_1200x627.jpg          → LinkedIn posts
`
      folder.file('details.txt', details)

      // Download and process image if exists
      // Download and process images
      const imagesToProcess: { url: string; isHero: boolean; index: number }[] = []

      // Add hero image
      if (article.imageUrl) {
        imagesToProcess.push({ url: article.imageUrl, isHero: true, index: 0 })
      }

      // Add other images (avoiding duplicates)
      if (article.images && Array.isArray(article.images)) {
        for (let j = 0; j < article.images.length; j++) {
          const imgUrl = article.images[j]
          // Skip if it's the same as hero image
          if (article.imageUrl && imgUrl === article.imageUrl) continue

          imagesToProcess.push({ url: imgUrl, isHero: false, index: j + 1 })
        }
      }

      const processedImages: string[] = []

      if (imagesToProcess.length > 0) {
        const imagesFolder = folder.folder('images')
        if (imagesFolder) {
          for (const imgTask of imagesToProcess) {
            try {
              // Try the Cloudinary proxy URL first (it handles CORS/blocking)
              // Then fall back to original URL if needed
              const urlsToTry = [imgTask.url]

              // Also try original URL if it's a Cloudinary proxy
              if (imgTask.url.indexOf('cloudinary.com') !== -1 && imgTask.url.indexOf('/fetch/') !== -1) {
                const parts = imgTask.url.split('/fetch/')
                if (parts[1]) {
                  // Get just the URL part (after any transforms like w_800,q_auto/)
                  const urlPart = parts[1].split('/').pop() || parts[1]
                  const originalUrl = decodeURIComponent(urlPart)
                  if (originalUrl.startsWith('http')) {
                    urlsToTry.push(originalUrl)
                  }
                }
              }

              let imageBuffer: Buffer | null = null

              for (const imageUrl of urlsToTry) {
                try {
                  const imageResponse = await fetch(imageUrl, {
                    headers: {
                      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                      'Accept': 'image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8',
                      'Accept-Language': 'en-US,en;q=0.9',
                      'Referer': 'https://www.google.com/'
                    }
                  })

                  if (imageResponse.ok) {
                    imageBuffer = Buffer.from(await imageResponse.arrayBuffer())
                    console.log(`[Social] Downloaded image from: ${imageUrl.slice(0, 50)}...`)
                    break
                  }
                } catch (e) {
                  console.log(`[Social] Failed to fetch: ${imageUrl.slice(0, 50)}...`)
                }
              }

              if (imageBuffer && imageBuffer.length > 1000) {
                // Convert to JPEG for consistency
                const jpegBuffer = await sharp(imageBuffer)
                  .jpeg({ quality: 90 })
                  .toBuffer()

                if (imgTask.isHero) {
                  // Save original hero
                  imagesFolder.file('original.jpg', jpegBuffer)
                  processedImages.push('original.jpg')

                  // Resize for each social media platform (Hero only)
                  for (const [key, size] of Object.entries(SOCIAL_SIZES)) {
                    try {
                      const resized = await sharp(jpegBuffer)
                        .resize(size.width, size.height, {
                          fit: 'cover',
                          position: 'center'
                        })
                        .jpeg({ quality: 90 })
                        .toBuffer()

                      imagesFolder.file(`${size.name}.jpg`, resized)
                    } catch (resizeErr) {
                      console.error(`Failed to resize for ${key}:`, resizeErr)
                    }
                  }
                } else {
                  // Save extra images
                  const filename = `extra_${imgTask.index}.jpg`
                  imagesFolder.file(filename, jpegBuffer)
                  processedImages.push(filename)
                }
              }
            } catch (imgError) {
              console.error(`Failed to process image ${imgTask.url}:`, imgError)
            }
          }
        }

        if (processedImages.length === 0) {
          folder.file('image_error.txt', `Failed to download any images.\nHero URL: ${article.imageUrl}`)
        }
      } else {
        folder.file('no_image.txt', 'This article has no images.')
      }
    }

    // Add README
    zip.file('README.txt', `BRIGHTWIRE SOCIAL MEDIA PACKAGE
================================
Generated: ${new Date().toISOString()}
Total Articles: ${articles.length}

EACH FOLDER CONTAINS:
- caption.txt → Ready to copy/paste caption with hashtags
- details.txt → Full article info
- images/     → Pre-sized images for all platforms:

  📱 twitter_facebook_1200x630.jpg
     Use for: Twitter, Facebook posts, Link previews

  📷 instagram_square_1080x1080.jpg
     Use for: Instagram Feed (square posts)

  📷 instagram_portrait_1080x1350.jpg
     Use for: Instagram Feed (portrait/vertical posts)

  📱 instagram_story_1080x1920.jpg
     Use for: Instagram Stories, Facebook Stories, TikTok

  💼 linkedin_1200x627.jpg
     Use for: LinkedIn posts

  🖼️ original.jpg
     The original article image

HOW TO POST:
1. Open article folder
2. Copy text from caption.txt
3. Choose the right image for your platform
4. Paste caption and upload image
5. Post!

No resizing needed - all images are ready to use! 🎉
`)

    // Generate zip
    const zipBuffer = await zip.generateAsync({
      type: 'nodebuffer',
      compression: 'DEFLATE',
      compressionOptions: { level: 6 }
    })

    // Return as downloadable zip
    setHeader(event, 'Content-Type', 'application/zip')
    setHeader(event, 'Content-Disposition', `attachment; filename="brightwire-social-${Date.now()}.zip"`)

    return zipBuffer
  } catch (error: any) {
    if (error.statusCode) throw error

    console.error('Social download error:', error)
    throw createError({
      statusCode: 500,
      message: 'Failed to generate social media package'
    })
  }
})
