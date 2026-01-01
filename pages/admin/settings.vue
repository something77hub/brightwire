<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Admin Header -->
    <header class="bg-white border-b border-gray-200">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 py-4">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 bg-gradient-to-br from-amber-400 to-orange-500 rounded-xl flex items-center justify-center">
              <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            </div>
            <div>
              <h1 class="text-xl font-bold text-gray-900">BrightWire Admin</h1>
              <p class="text-sm text-gray-500">Settings</p>
            </div>
          </div>
          <NuxtLink to="/" class="text-amber-600 hover:text-amber-700 font-medium">View Site →</NuxtLink>
          <button @click="logout" class="text-gray-500 hover:text-gray-700 p-2 rounded-lg hover:bg-gray-100 ml-2">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
          </button>
        </div>
      </div>
    </header>

    <div class="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      <!-- Navigation Tabs -->
      <nav class="flex gap-1 mb-8 bg-white rounded-xl p-1 shadow-sm">
        <NuxtLink 
          to="/admin" 
          class="flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-gray-600 hover:bg-gray-100"
        >
          Dashboard
        </NuxtLink>
        <NuxtLink 
          to="/admin/articles" 
          class="flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-gray-600 hover:bg-gray-100"
        >
          Articles
        </NuxtLink>
        <NuxtLink 
          to="/admin/settings" 
          class="flex items-center gap-2 px-4 py-2 rounded-lg font-medium bg-amber-500 text-white"
        >
          Settings
        </NuxtLink>
      </nav>

      <!-- Settings Form -->
      <div class="space-y-6">
        <!-- Site Settings -->
        <div class="bg-white rounded-xl p-6 shadow-sm">
          <h2 class="text-lg font-semibold text-gray-900 mb-6">Site Settings</h2>
          
          <div class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Site Name</label>
              <input 
                v-model="settings.siteName" 
                type="text" 
                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                placeholder="BrightWire"
              />
            </div>
            
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Site URL (Domain)</label>
              <input 
                v-model="settings.siteUrl" 
                type="url" 
                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                placeholder="https://brightwire.news"
              />
              <p class="text-sm text-gray-500 mt-1">Used for share links and SEO. Include https://</p>
            </div>
            
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Site Description</label>
              <textarea 
                v-model="settings.siteDescription" 
                rows="2"
                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                placeholder="Your daily dose of positive news"
              ></textarea>
            </div>
            
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Contact Email</label>
              <input 
                v-model="settings.contactEmail" 
                type="email" 
                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                placeholder="contact@brightwire.news"
              />
              <p class="text-sm text-gray-500 mt-1">Shown on the contact page</p>
            </div>
            
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Default Author Name</label>
              <input 
                v-model="settings.defaultAuthor" 
                type="text" 
                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                placeholder="Felix Utomi"
              />
              <p class="text-sm text-gray-500 mt-1">Author name shown on new articles</p>
              <button
                @click="updateAllAuthors"
                :disabled="updatingAuthors"
                class="mt-2 text-sm text-amber-600 hover:text-amber-700 font-medium disabled:opacity-50"
              >
                {{ updatingAuthors ? 'Updating...' : '→ Apply to all existing articles' }}
              </button>
              <p v-if="authorUpdateResult" class="text-sm text-green-600 mt-1">{{ authorUpdateResult }}</p>
            </div>
          </div>
        </div>

        <!-- Social Media -->
        <div class="bg-white rounded-xl p-6 shadow-sm">
          <h2 class="text-lg font-semibold text-gray-900 mb-6">Social Media Links</h2>
          
          <div class="grid sm:grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Twitter/X</label>
              <input 
                v-model="settings.socialTwitter" 
                type="url" 
                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                placeholder="https://twitter.com/brightwire"
              />
            </div>
            
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Instagram</label>
              <input 
                v-model="settings.socialInstagram" 
                type="url" 
                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                placeholder="https://instagram.com/brightwire"
              />
            </div>
            
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Facebook</label>
              <input 
                v-model="settings.socialFacebook" 
                type="url" 
                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                placeholder="https://facebook.com/brightwire"
              />
            </div>
            
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">LinkedIn</label>
              <input 
                v-model="settings.socialLinkedin" 
                type="url" 
                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                placeholder="https://linkedin.com/company/brightwire"
              />
            </div>
            
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">YouTube</label>
              <input 
                v-model="settings.socialYoutube" 
                type="url" 
                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                placeholder="https://youtube.com/@brightwire"
              />
            </div>
            
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">TikTok</label>
              <input 
                v-model="settings.socialTiktok" 
                type="url" 
                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                placeholder="https://tiktok.com/@brightwire"
              />
            </div>
          </div>
        </div>

        <!-- Newsletter Settings -->
        <div class="bg-white rounded-xl p-6 shadow-sm">
          <h2 class="text-lg font-semibold text-gray-900 mb-6">Newsletter</h2>
          
          <div class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Title/Heading</label>
              <input 
                v-model="settings.newsletterTitle" 
                type="text" 
                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                placeholder="Start Your Day With Good News"
              />
            </div>
            
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Subtitle/Description</label>
              <textarea 
                v-model="settings.newsletterSubtitle" 
                rows="2"
                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                placeholder="Join 50,000+ readers who wake up to stories that inspire."
              ></textarea>
            </div>
            
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Button Text</label>
              <input 
                v-model="settings.newsletterButtonText" 
                type="text" 
                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                placeholder="Subscribe Free"
              />
            </div>
            
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Success Message</label>
              <input 
                v-model="settings.newsletterSuccessMessage" 
                type="text" 
                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                placeholder="You're in! Check your inbox."
              />
            </div>
          </div>
        </div>

        <!-- SEO Settings -->
        <div class="bg-white rounded-xl p-6 shadow-sm">
          <h2 class="text-lg font-semibold text-gray-900 mb-6">SEO & Meta</h2>
          
          <div class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Default Meta Title</label>
              <input 
                v-model="settings.metaTitle" 
                type="text" 
                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                placeholder="BrightWire - Good News Daily"
              />
            </div>
            
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Default Meta Description</label>
              <textarea 
                v-model="settings.metaDescription" 
                rows="2"
                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                placeholder="Your daily source for positive, uplifting news stories from around the world."
              ></textarea>
            </div>
            
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Default OG Image URL</label>
              <input 
                v-model="settings.ogImage" 
                type="url" 
                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                placeholder="https://brightwire.news/og-image.jpg"
              />
            </div>
          </div>
        </div>

        <!-- Save Button -->
        <div class="flex justify-end gap-4">
          <button 
            @click="resetSettings"
            class="px-6 py-2 border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50"
          >
            Reset to Defaults
          </button>
          <button 
            @click="saveSettings"
            :disabled="saving"
            class="px-6 py-2 bg-amber-500 text-white rounded-lg font-medium hover:bg-amber-600 disabled:opacity-50 flex items-center gap-2"
          >
            <svg v-if="saving" class="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            {{ saving ? 'Saving...' : 'Save Settings' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const router = useRouter()
const saving = ref(false)
const updatingAuthors = ref(false)
const authorUpdateResult = ref('')

// Check auth on page load
const { data: authCheck } = await useFetch('/api/admin/check')
if (!authCheck.value?.authenticated) {
  await navigateTo('/admin/login')
}

// Logout function
async function logout() {
  await $fetch('/api/admin/logout', { method: 'POST' })
  router.push('/admin/login')
}

// Update all existing articles with current author name
async function updateAllAuthors() {
  if (!confirm('This will update ALL existing articles to use the current author name. Continue?')) {
    return
  }
  
  updatingAuthors.value = true
  authorUpdateResult.value = ''
  
  try {
    // Save settings first to ensure the author name is saved
    await $fetch('/api/admin/settings', {
      method: 'POST',
      body: settings.value,
    })
    
    // Then update all articles
    const result = await $fetch('/api/admin/update-authors', { method: 'POST' })
    authorUpdateResult.value = result.message
  } catch (e) {
    console.error('Failed to update authors:', e)
    authorUpdateResult.value = 'Failed to update authors'
  } finally {
    updatingAuthors.value = false
  }
}

const defaultSettings = {
  siteName: 'BrightWire',
  siteUrl: 'https://brightwire.news',
  siteDescription: 'Your daily dose of positive news',
  contactEmail: 'contact@brightwire.news',
  defaultAuthor: 'Felix Utomi',
  socialTwitter: '',
  socialInstagram: '',
  socialFacebook: '',
  socialLinkedin: '',
  socialYoutube: '',
  socialTiktok: '',
  metaTitle: 'BrightWire - Good News Daily',
  metaDescription: 'Your daily source for positive, uplifting news stories from around the world.',
  ogImage: '',
  // Newsletter settings
  newsletterTitle: 'Start Your Day With Good News',
  newsletterSubtitle: 'Join 50,000+ readers who wake up to stories that inspire. Delivered fresh every morning.',
  newsletterButtonText: 'Subscribe Free',
  newsletterSuccessMessage: "You're in! Check your inbox.",
}

const settings = ref({ ...defaultSettings })

// Load settings from API
const { data: savedSettings } = await useFetch('/api/admin/settings')
if (savedSettings.value) {
  settings.value = { ...defaultSettings, ...savedSettings.value }
}

async function saveSettings() {
  saving.value = true
  try {
    await $fetch('/api/admin/settings', {
      method: 'POST',
      body: settings.value,
    })
    alert('Settings saved successfully!')
  } catch (e) {
    alert('Failed to save settings')
    console.error(e)
  } finally {
    saving.value = false
  }
}

function resetSettings() {
  if (confirm('Reset all settings to defaults?')) {
    settings.value = { ...defaultSettings }
  }
}

useHead({
  title: 'Settings - BrightWire Admin',
})
</script>
