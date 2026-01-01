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
            <p class="text-xs text-gray-500">Global configuration for BrightWire</p>
          </div>
        </div>
      </div>
    </header>

    <main class="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-8">
      <!-- 1. General Settings -->
      <div class="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div class="px-6 py-4 border-b border-gray-200">
          <h2 class="font-semibold text-gray-900">Ingestion Settings</h2>
        </div>
        <div class="p-6">
          <div class="max-w-md">
            <label class="block text-sm font-medium text-gray-700 mb-2">News Fetch Frequency</label>
            <select
              v-model="fetchInterval"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-gray-500 focus:border-gray-500"
            >
              <option :value="15">Every 15 minutes (High Traffic)</option>
              <option :value="30">Every 30 minutes</option>
              <option :value="60">Every hour (Recommended)</option>
              <option :value="120">Every 2 hours</option>
              <option :value="360">Every 6 hours</option>
            </select>
            <p class="text-xs text-gray-500 mt-2">
              Note: This setting controls how often the system checks for new stories from your configured feeds.
            </p>
            
            <div class="mt-4">
              <button
                @click="saveSettings"
                :disabled="savingSettings"
                class="px-4 py-2 bg-gray-900 text-white rounded-lg text-sm font-medium hover:bg-gray-800 disabled:opacity-50"
              >
                {{ savingSettings ? 'Saving...' : 'Save Configuration' }}
              </button>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Maintenance -->
      <div class="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div class="px-6 py-4 border-b border-gray-200">
          <h2 class="font-semibold text-gray-900">Maintenance</h2>
        </div>
        <div class="p-6 space-y-4">
           <div>
             <h3 class="text-sm font-medium text-gray-900">Clear Article Queue</h3>
             <p class="text-xs text-gray-500 mb-3">Remove all pending articles from the ingestion queue.</p>
             <button
               @click="clearQueue"
               class="px-3 py-1.5 bg-red-50 text-red-600 rounded-lg text-xs font-medium hover:bg-red-100"
             >
               Clear Queue
             </button>
           </div>
        </div>
      </div>
      
    </main>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: false })

const fetchInterval = ref(60)
const savingSettings = ref(false)

// Load data
async function loadData() {
  try {
    const settingsData = await $fetch('/api/admin/settings')
    fetchInterval.value = settingsData.fetchInterval || 60
  } catch (e) {
    console.error(e)
  }
}

async function saveSettings() {
  savingSettings.value = true
  try {
    await $fetch('/api/admin/settings', {
      method: 'POST',
      body: { fetchInterval: fetchInterval.value }
    })
    alert('Settings saved!')
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
