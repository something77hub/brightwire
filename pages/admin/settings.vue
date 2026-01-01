<template>
  <div class="min-h-screen bg-gray-50 pb-12">
    <!-- Header -->
    <header class="bg-white border-b border-gray-200 sticky top-0 z-40">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
        <div class="flex items-center space-x-4">
          <NuxtLink to="/admin" class="text-gray-400 hover:text-gray-600">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"/>
            </svg>
          </NuxtLink>
          <div class="w-10 h-10 bg-gradient-to-br from-gray-700 to-gray-900 rounded-xl flex items-center justify-center">
            <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </div>
          <div>
            <h1 class="text-xl font-bold text-gray-900">System Settings</h1>
            <p class="text-xs text-gray-500">Configure global site settings</p>
          </div>
        </div>
        <button
          @click="saveSettings"
          :disabled="savingSettings"
          class="px-4 py-2 bg-gray-900 text-white rounded-lg text-sm font-medium hover:bg-gray-800 disabled:opacity-50 flex items-center gap-2"
        >
          <svg v-if="savingSettings" class="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          {{ savingSettings ? 'Saving...' : 'Save All Changes' }}
        </button>
      </div>
    </header>

    <main class="max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-8">
      
      <!-- 1. General Site Info -->
      <section class="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div class="px-6 py-4 border-b border-gray-200 bg-gray-50">
          <h2 class="font-semibold text-gray-900">General Information</h2>
        </div>
        <div class="p-6 grid grid-cols-1 gap-6">
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Site Name</label>
              <input v-model="form.siteName" type="text" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-amber-500 focus:border-amber-500 sm:text-sm">
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Site URL</label>
              <input v-model="form.siteUrl" type="url" placeholder="https://..." class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-amber-500 focus:border-amber-500 sm:text-sm">
            </div>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Site Description</label>
            <textarea v-model="form.siteDescription" rows="2" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-amber-500 focus:border-amber-500 sm:text-sm"></textarea>
          </div>
        </div>
      </section>

      <!-- 2. Social Media & Contact -->
      <section class="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div class="px-6 py-4 border-b border-gray-200 bg-gray-50">
          <h2 class="font-semibold text-gray-900">Social Media & Contact</h2>
        </div>
        <div class="p-6 grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div class="sm:col-span-2">
            <label class="block text-sm font-medium text-gray-700 mb-1">Contact Email</label>
            <input v-model="form.contactEmail" type="email" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-amber-500 focus:border-amber-500 sm:text-sm">
          </div>
          
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Twitter URL</label>
            <input v-model="form.socialTwitter" type="url" placeholder="https://twitter.com/..." class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-amber-500 focus:border-amber-500 sm:text-sm">
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Facebook URL</label>
            <input v-model="form.socialFacebook" type="url" placeholder="https://facebook.com/..." class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-amber-500 focus:border-amber-500 sm:text-sm">
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Instagram URL</label>
            <input v-model="form.socialInstagram" type="url" placeholder="https://instagram.com/..." class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-amber-500 focus:border-amber-500 sm:text-sm">
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">LinkedIn URL</label>
            <input v-model="form.socialLinkedin" type="url" placeholder="https://linkedin.com/in/..." class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-amber-500 focus:border-amber-500 sm:text-sm">
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">YouTube URL</label>
            <input v-model="form.socialYoutube" type="url" placeholder="https://youtube.com/..." class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-amber-500 focus:border-amber-500 sm:text-sm">
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">TikTok URL</label>
            <input v-model="form.socialTiktok" type="url" placeholder="https://tiktok.com/..." class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-amber-500 focus:border-amber-500 sm:text-sm">
          </div>
        </div>
      </section>

      <!-- 3. Newsletter -->
      <section class="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div class="px-6 py-4 border-b border-gray-200 bg-gray-50">
          <h2 class="font-semibold text-gray-900">Newsletter Configuration</h2>
        </div>
        <div class="p-6">
          <label class="block text-sm font-medium text-gray-700 mb-1">Success Message</label>
          <input v-model="form.newsletterSuccessMessage" type="text" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-amber-500 focus:border-amber-500 sm:text-sm">
          <p class="text-xs text-gray-500 mt-1">Message shown to users after they subscribe successfully.</p>
        </div>
      </section>

      <!-- 4. Ingestion Settings (The New Stuff) -->
      <section class="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div class="px-6 py-4 border-b border-gray-200 bg-gray-50 flex items-center justify-between">
          <h2 class="font-semibold text-gray-900">Ingestion Configuration</h2>
          <span class="px-2 py-0.5 rounded text-xs font-medium bg-amber-100 text-amber-800">Advanced</span>
        </div>
        <div class="p-6">
          <div class="max-w-md">
            <label class="block text-sm font-medium text-gray-700 mb-2">News Fetch Frequency</label>
            <select
              v-model="form.fetchInterval"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-amber-500 focus:border-amber-500"
            >
              <option :value="15">Every 15 minutes (High Traffic)</option>
              <option :value="30">Every 30 minutes</option>
              <option :value="60">Every hour (Recommended)</option>
              <option :value="120">Every 2 hours</option>
              <option :value="360">Every 6 hours</option>
            </select>
            <p class="text-xs text-gray-500 mt-2">
              Controls how often the system checks for new stories from feeds.
            </p>
          </div>
        </div>
      </section>
      
      <!-- 5. Maintenance -->
      <section class="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden border-l-4 border-l-red-500">
        <div class="px-6 py-4 border-b border-gray-200 bg-gray-50">
          <h2 class="font-semibold text-gray-900 text-red-700">Danger Zone</h2>
        </div>
        <div class="p-6 flex items-center justify-between">
           <div>
             <h3 class="text-sm font-medium text-gray-900">Clear Article Queue</h3>
             <p class="text-xs text-gray-500">Remove all pending articles from the ingestion queue.</p>
           </div>
           <button
             @click="clearQueue"
             class="px-4 py-2 bg-white border border-red-200 text-red-600 rounded-lg text-sm font-medium hover:bg-red-50 transition-colors"
           >
             Clear Queue
           </button>
        </div>
      </section>
      
    </main>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: false })

const savingSettings = ref(false)
const form = ref({
  fetchInterval: 60,
  siteName: '',
  siteDescription: '',
  siteUrl: '',
  contactEmail: '',
  newsletterSuccessMessage: '',
  // Flat structure to match DB
  socialTwitter: '',
  socialFacebook: '',
  socialInstagram: '',
  socialLinkedin: '',
  socialYoutube: '',
  socialTiktok: ''
})

// Load data
async function loadData() {
  try {
    const data = await $fetch('/api/admin/settings')
    form.value = {
      fetchInterval: data.fetchInterval || 60,
      siteName: data.siteName || '',
      siteDescription: data.siteDescription || '',
      siteUrl: data.siteUrl || '',
      contactEmail: data.contactEmail || '',
      newsletterSuccessMessage: data.newsletterSuccessMessage || '',
      
      socialTwitter: data.socialTwitter || '',
      socialFacebook: data.socialFacebook || '',
      socialInstagram: data.socialInstagram || '',
      socialLinkedin: data.socialLinkedin || '',
      socialYoutube: data.socialYoutube || '',
      socialTiktok: data.socialTiktok || ''
    }
  } catch (e) {
    console.error(e)
    alert('Failed to load settings')
  }
}

async function saveSettings() {
  savingSettings.value = true
  try {
    await $fetch('/api/admin/settings', {
      method: 'POST',
      body: { 
        ...form.value,
        fetchInterval: Number(form.value.fetchInterval)
      }
    })
    alert('Settings saved successfully!')
  } catch (e) {
    alert('Failed to save settings')
  } finally {
    savingSettings.value = false
  }
}

async function clearQueue() {
  if (!confirm('Are you sure you want to clear the queue? This cannot be undone.')) return
  try {
    await $fetch('/api/admin/clear-queue', { method: 'POST' })
    alert('Queue cleared!')
  } catch (e) {
    alert('Failed to clear queue')
  }
}

onMounted(() => {
  loadData()
})
</script>
