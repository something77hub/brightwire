<template>
  <div>
    <Header />
    
    <main class="max-w-4xl mx-auto px-4 sm:px-6 py-12 sm:py-16">
      <!-- Hero -->
      <div class="text-center mb-12">
        <span class="text-6xl mb-4 block">💬</span>
        <h1 class="text-4xl sm:text-5xl font-bold text-amber-950 font-display mb-4">
          Contact Us
        </h1>
        <p class="text-xl text-amber-700/70">
          We'd love to hear from you.
        </p>
      </div>

      <div class="grid lg:grid-cols-2 gap-8">
        <!-- Contact Form -->
        <div class="bg-white rounded-2xl p-8 shadow-lg">
          <h2 class="text-xl font-bold text-amber-900 mb-6">Send a Message</h2>
          
          <form @submit.prevent="submitForm" class="space-y-5">
            <div>
              <label for="name" class="block text-sm font-semibold text-amber-900 mb-2">Name</label>
              <input 
                type="text" 
                id="name" 
                v-model="form.name"
                required
                class="w-full px-4 py-3 border border-amber-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
              />
            </div>

            <div>
              <label for="email" class="block text-sm font-semibold text-amber-900 mb-2">Email</label>
              <input 
                type="email" 
                id="email" 
                v-model="form.email"
                required
                class="w-full px-4 py-3 border border-amber-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
              />
            </div>

            <div>
              <label for="subject" class="block text-sm font-semibold text-amber-900 mb-2">Subject</label>
              <select 
                id="subject" 
                v-model="form.subject"
                required
                class="w-full px-4 py-3 border border-amber-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent bg-white"
              >
                <option value="">Select a topic</option>
                <option value="general">General Inquiry</option>
                <option value="story">Story Submission</option>
                <option value="advertising">Advertising</option>
                <option value="partnership">Partnership</option>
                <option value="press">Press/Media</option>
                <option value="technical">Technical Issue</option>
                <option value="feedback">Feedback</option>
              </select>
            </div>

            <div>
              <label for="message" class="block text-sm font-semibold text-amber-900 mb-2">Message</label>
              <textarea 
                id="message" 
                v-model="form.message"
                required
                rows="5"
                class="w-full px-4 py-3 border border-amber-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent resize-none"
              ></textarea>
            </div>

            <button 
              type="submit"
              :disabled="submitting"
              class="w-full bg-gradient-to-r from-amber-500 to-orange-500 text-white py-3 rounded-xl font-semibold hover:shadow-lg hover:shadow-amber-500/25 transition-all disabled:opacity-50"
            >
              {{ submitting ? 'Sending...' : 'Send Message' }}
            </button>
          </form>

          <div v-if="submitted" class="mt-6 p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-center">
            <span class="text-xl block mb-1">✓</span>
            <p class="font-semibold">Message sent!</p>
            <p class="text-sm text-emerald-600">We'll get back to you within 24-48 hours.</p>
          </div>

          <div v-if="error" class="mt-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-800 text-center">
            <span class="text-xl block mb-1">✕</span>
            <p class="font-semibold">{{ error }}</p>
          </div>
        </div>

        <!-- Contact Info -->
        <div class="space-y-6">
          <div class="bg-white rounded-2xl p-8 shadow-lg">
            <h2 class="text-xl font-bold text-amber-900 mb-6">Other Ways to Reach Us</h2>
            
            <div class="space-y-5">
              <!-- Email -->
              <div v-if="siteSettings?.contactEmail" class="flex items-start gap-4">
                <div class="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <svg class="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <div>
                  <h3 class="font-semibold text-amber-900">Email</h3>
                  <a :href="`mailto:${siteSettings.contactEmail}`" class="text-amber-600 hover:underline">{{ siteSettings.contactEmail }}</a>
                </div>
              </div>

              <!-- Twitter/X -->
              <div v-if="siteSettings?.socialTwitter" class="flex items-start gap-4">
                <div class="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <svg class="w-5 h-5 text-amber-600" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                  </svg>
                </div>
                <div>
                  <h3 class="font-semibold text-amber-900">Twitter / X</h3>
                  <a :href="siteSettings.socialTwitter" target="_blank" class="text-amber-600 hover:underline">{{ formatSocialHandle(siteSettings.socialTwitter) }}</a>
                </div>
              </div>

              <!-- Instagram -->
              <div v-if="siteSettings?.socialInstagram" class="flex items-start gap-4">
                <div class="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <svg class="w-5 h-5 text-amber-600" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                  </svg>
                </div>
                <div>
                  <h3 class="font-semibold text-amber-900">Instagram</h3>
                  <a :href="siteSettings.socialInstagram" target="_blank" class="text-amber-600 hover:underline">{{ formatSocialHandle(siteSettings.socialInstagram) }}</a>
                </div>
              </div>

              <!-- Facebook -->
              <div v-if="siteSettings?.socialFacebook" class="flex items-start gap-4">
                <div class="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <svg class="w-5 h-5 text-amber-600" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                  </svg>
                </div>
                <div>
                  <h3 class="font-semibold text-amber-900">Facebook</h3>
                  <a :href="siteSettings.socialFacebook" target="_blank" class="text-amber-600 hover:underline">{{ formatSocialHandle(siteSettings.socialFacebook, 'facebook') }}</a>
                </div>
              </div>

              <!-- LinkedIn -->
              <div v-if="siteSettings?.socialLinkedin" class="flex items-start gap-4">
                <div class="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <svg class="w-5 h-5 text-amber-600" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                  </svg>
                </div>
                <div>
                  <h3 class="font-semibold text-amber-900">LinkedIn</h3>
                  <a :href="siteSettings.socialLinkedin" target="_blank" class="text-amber-600 hover:underline">{{ formatSocialHandle(siteSettings.socialLinkedin, 'linkedin') }}</a>
                </div>
              </div>

              <!-- YouTube -->
              <div v-if="siteSettings?.socialYoutube" class="flex items-start gap-4">
                <div class="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <svg class="w-5 h-5 text-amber-600" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                  </svg>
                </div>
                <div>
                  <h3 class="font-semibold text-amber-900">YouTube</h3>
                  <a :href="siteSettings.socialYoutube" target="_blank" class="text-amber-600 hover:underline">{{ formatSocialHandle(siteSettings.socialYoutube, 'youtube') }}</a>
                </div>
              </div>

              <!-- TikTok -->
              <div v-if="siteSettings?.socialTiktok" class="flex items-start gap-4">
                <div class="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <svg class="w-5 h-5 text-amber-600" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z"/>
                  </svg>
                </div>
                <div>
                  <h3 class="font-semibold text-amber-900">TikTok</h3>
                  <a :href="siteSettings.socialTiktok" target="_blank" class="text-amber-600 hover:underline">{{ formatSocialHandle(siteSettings.socialTiktok) }}</a>
                </div>
              </div>

              <!-- Fallback if no social links -->
              <div v-if="!hasAnySocialLinks" class="text-amber-600/70 text-sm">
                Social links coming soon!
              </div>
            </div>
          </div>

          <div class="bg-amber-50 rounded-2xl p-8">
            <h2 class="text-xl font-bold text-amber-900 mb-4">Quick Links</h2>
            <ul class="space-y-3">
              <li>
                <NuxtLink to="/submit" class="text-amber-700 hover:text-amber-900 flex items-center gap-2">
                  <span>📝</span> Submit a Story
                </NuxtLink>
              </li>
              <li>
                <NuxtLink to="/advertise" class="text-amber-700 hover:text-amber-900 flex items-center gap-2">
                  <span>📢</span> Advertising Inquiries
                </NuxtLink>
              </li>
              <li>
                <NuxtLink to="/careers" class="text-amber-700 hover:text-amber-900 flex items-center gap-2">
                  <span>💼</span> Careers at BrightWire
                </NuxtLink>
              </li>
            </ul>
          </div>

          <div class="bg-white rounded-2xl p-8 shadow-lg">
            <h2 class="text-xl font-bold text-amber-900 mb-4">Response Time</h2>
            <p class="text-amber-700/70">
              We typically respond within <span class="font-semibold text-amber-900">24-48 hours</span> during business days. For urgent matters, please indicate in your subject line.
            </p>
          </div>
        </div>
      </div>
    </main>

    <Footer />
  </div>
</template>

<script setup>
const config = useRuntimeConfig()

// Fetch site settings
const { data: siteSettings } = await useFetch('/api/site-settings')

const form = reactive({
  name: '',
  email: '',
  subject: '',
  message: ''
})

const submitting = ref(false)
const submitted = ref(false)
const error = ref('')

// Check if any social links exist
const hasAnySocialLinks = computed(() => {
  if (!siteSettings.value) return false
  return siteSettings.value.contactEmail || 
         siteSettings.value.socialTwitter || 
         siteSettings.value.socialInstagram || 
         siteSettings.value.socialFacebook ||
         siteSettings.value.socialLinkedin ||
         siteSettings.value.socialYoutube ||
         siteSettings.value.socialTiktok
})

// Format social handle from URL
function formatSocialHandle(url, platform = '') {
  if (!url) return ''
  try {
    const urlObj = new URL(url)
    const path = urlObj.pathname.replace(/^\/+|\/+$/g, '')
    
    // Handle different formats
    if (platform === 'facebook' || platform === 'linkedin') {
      return path.split('/').pop() || path
    }
    if (platform === 'youtube') {
      if (path.startsWith('@')) return path
      if (path.includes('channel/')) return 'YouTube Channel'
      return '@' + path.split('/').pop()
    }
    
    // Default: return @username format
    const handle = path.split('/').pop() || path
    return handle.startsWith('@') ? handle : '@' + handle
  } catch {
    return url
  }
}

async function submitForm() {
  submitting.value = true
  error.value = ''
  
  try {
    // Submit to our API (uses Resend)
    const response = await $fetch('/api/contact', {
      method: 'POST',
      body: {
        name: form.name,
        email: form.email,
        subject: form.subject,
        message: form.message,
      }
    })
    
    submitted.value = true
    form.name = ''
    form.email = ''
    form.subject = ''
    form.message = ''
  } catch (err) {
    error.value = err.data?.message || 'Failed to send message. Please try again.'
  } finally {
    submitting.value = false
  }
}

useHead({
  title: 'Contact Us - BrightWire',
  meta: [
    { name: 'description', content: 'Get in touch with BrightWire. We\'d love to hear from you.' }
  ]
})
</script>
