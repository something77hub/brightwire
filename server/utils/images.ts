/**
 * Cloudinary Image Proxy
 * 
 * Uses Cloudinary's fetch feature to proxy and cache original images.
 * This solves:
 * - Hotlinking issues (some sites block external referrers)
 * - Image optimization (auto format, quality, resizing)
 * - CDN caching (faster loads globally)
 * - Broken image fallback
 */

const CLOUDINARY_CLOUD = process.env.CLOUDINARY_CLOUD_NAME || 'demo'

export interface ImageOptions {
  width?: number
  height?: number
  quality?: 'auto' | number
  format?: 'auto' | 'webp' | 'avif' | 'jpg' | 'png'
  crop?: 'fill' | 'fit' | 'scale' | 'thumb'
  gravity?: 'auto' | 'face' | 'center'
}

/**
 * Convert an original image URL to a Cloudinary proxied URL
 */
export function proxyImage(originalUrl: string, options: ImageOptions = {}): string {
  if (!originalUrl) return ''
  
  // Skip if already a Cloudinary URL
  if (originalUrl.includes('cloudinary.com')) {
    return originalUrl
  }
  
  // Skip data URLs
  if (originalUrl.startsWith('data:')) {
    return originalUrl
  }
  
  // Build transformation string
  const transforms: string[] = []
  
  if (options.width) transforms.push(`w_${options.width}`)
  if (options.height) transforms.push(`h_${options.height}`)
  if (options.crop) transforms.push(`c_${options.crop}`)
  if (options.gravity) transforms.push(`g_${options.gravity}`)
  if (options.quality) transforms.push(`q_${options.quality}`)
  if (options.format) transforms.push(`f_${options.format}`)
  
  // Default optimizations
  if (!options.quality) transforms.push('q_auto')
  if (!options.format) transforms.push('f_auto')
  
  const transformString = transforms.length > 0 ? transforms.join(',') + '/' : ''
  
  // Encode the original URL
  const encodedUrl = encodeURIComponent(originalUrl)
  
  // Cloudinary fetch URL format
  return `https://res.cloudinary.com/${CLOUDINARY_CLOUD}/image/fetch/${transformString}${encodedUrl}`
}

/**
 * Get optimized image URL for article hero
 */
export function getHeroImage(originalUrl: string): string {
  return proxyImage(originalUrl, {
    width: 1200,
    height: 630,
    crop: 'fill',
    gravity: 'auto',
    quality: 'auto',
    format: 'auto',
  })
}

/**
 * Get optimized image URL for article cards
 */
export function getCardImage(originalUrl: string): string {
  return proxyImage(originalUrl, {
    width: 600,
    height: 400,
    crop: 'fill',
    gravity: 'auto',
    quality: 'auto',
    format: 'auto',
  })
}

/**
 * Get optimized image URL for thumbnails
 */
export function getThumbnail(originalUrl: string): string {
  return proxyImage(originalUrl, {
    width: 200,
    height: 200,
    crop: 'thumb',
    gravity: 'face',
    quality: 'auto',
    format: 'auto',
  })
}

/**
 * Get optimized image URL for content images
 */
export function getContentImage(originalUrl: string): string {
  return proxyImage(originalUrl, {
    width: 800,
    quality: 'auto',
    format: 'auto',
  })
}

/**
 * Extract and proxy all images from HTML content
 */
export function proxyImagesInContent(htmlContent: string): string {
  // Match all img src attributes
  return htmlContent.replace(
    /<img([^>]*)\ssrc=["']([^"']+)["']([^>]*)>/gi,
    (match, before, src, after) => {
      const proxiedSrc = getContentImage(src)
      return `<img${before} src="${proxiedSrc}"${after}>`
    }
  )
}
