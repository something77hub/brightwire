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
            <h1 class="text-xl font-bold text-gray-900">Settings & Feeds</h1>
            <p class="text-xs text-gray-500">Configure system behavior and news sources</p>
          </div>
        </div>
      </div>
    </header>

    <main class="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-8">
      <!-- 1. General Settings -->
      <div class="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div class="px-6 py-4 border-b border-gray-200">
          <h2 class="font-semibold text-gray-900">General Configuration</h2>
        </div>
        <div class="p-6">
          <div class="max-w-md">
            <label class="block text-sm font-medium text-gray-700 mb-2">News Fetch Frequency</label>
            <select
              v-model="fetchInterval"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-amber-500 focus:border-amber-500"
            >
              <option :value="15">Every 15 minutes (High Traffic)</option>
              <option :value="30">Every 30 minutes</option>
              <option :value="60">Every hour (Recommended)</option>
              <option :value="120">Every 2 hours</option>
              <option :value="360">Every 6 hours</option>
            </select>
            <p class="text-xs text-gray-500 mt-2">
              Note: The fetcher runs on a fixed schedule. This setting controls whether it skips a run.
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

      <!-- 2. Feed Manager -->
      <div class="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div class="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <h2 class="font-semibold text-gray-900">News Feeds ({{ feeds.length }})</h2>
          <button
            @click="openFeedModal()"
            class="px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-white rounded-lg text-sm font-medium transition-colors"
          >
            + Add Feed
          </button>
        </div>
        
        <!-- Feed List -->
        <div class="overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50">
              <tr>
                <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Source Name</th>
                <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Feed URL</th>
                <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th scope="col" class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              <tr v-if="loadingFeeds">
                <td colspan="4" class="px-6 py-4 text-center text-sm text-gray-500">Loading feeds...</td>
              </tr>
              <tr v-else-if="feeds.length === 0">
                <td colspan="4" class="px-6 py-4 text-center text-sm text-gray-500">No feeds found.</td>
              </tr>
              <tr v-for="feed in feeds" :key="feed._id">
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="text-sm font-medium text-gray-900">{{ feed.name }}</div>
                  <div class="text-xs text-gray-500">{{ feed.category || 'General' }}</div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="text-sm text-gray-500 max-w-xs truncate" :title="feed.feed">{{ feed.feed }}</div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <span
                    class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full"
                    :class="feed.enabled !== false ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'"
                  >
                    {{ feed.enabled !== false ? 'Active' : 'Disabled' }}
                  </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button @click="openFeedModal(feed)" class="text-indigo-600 hover:text-indigo-900 mr-4">Edit</button>
                  <button @click="deleteFeed(feed)" class="text-red-600 hover:text-red-900">Delete</button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </main>

    <!-- Modal -->
    <div v-if="showModal" class="fixed inset-0 z-50 overflow-y-auto">
      <div class="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div class="fixed inset-0 transition-opacity" @click="showModal = false">
          <div class="absolute inset-0 bg-gray-500 opacity-75"></div>
        </div>

        <span class="hidden sm:inline-block sm:align-middle sm:h-screen">&#8203;</span>

        <div class="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg w-full">
          <div class="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <h3 class="text-lg leading-6 font-medium text-gray-900 mb-4">
              {{ editingFeed ? 'Edit Feed' : 'Add New Feed' }}
            </h3>
            
            <div class="space-y-4">
              <div>
                <label class="block text-sm font-medium text-gray-700">Source Name</label>
                <input v-model="form.name" type="text" class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm">
              </div>
              
              <div>
                <label class="block text-sm font-medium text-gray-700">Feed URL (RSS/Atom)</label>
                <input v-model="form.feed" type="text" class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm">
              </div>
              
              <div>
                <label class="block text-sm font-medium text-gray-700">Website URL</label>
                <input v-model="form.baseUrl" type="text" class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm">
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700">Default Category (Optional)</label>
                <select v-model="form.category" class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm">
                    <option value="">Auto-Detect</option>
                    <option value="good-news">Good News</option>
                    <option value="sports">Sports</option>
                    <option value="heroes">Heroes</option>
                    <option value="innovation">Innovation</option>
                    <option value="planet">Planet</option>
                </select>
              </div>
              
              <div class="flex items-center">
                <input v-model="form.enabled" type="checkbox" class="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded">
                <label class="ml-2 block text-sm text-gray-900">Enable this feed</label>
              </div>
            </div>
          </div>
          
          <div class="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
            <button 
              @click="saveFeed" 
              type="button" 
              class="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-indigo-600 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:ml-3 sm:w-auto sm:text-sm"
              :disabled="savingFeed"
            >
              {{ savingFeed ? 'Saving...' : 'Save' }}
            </button>
            <button @click="showModal = false" type="button" class="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm">
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: false })

const fetchInterval = ref(60)
const savingSettings = ref(false)
const loadingFeeds = ref(false)
const feeds = ref<any[]>([])
const showModal = ref(false)
const editingFeed = ref<any>(null)
const savingFeed = ref(false)

const form = ref({
  name: '',
  feed: '',
  baseUrl: '',
  category: '',
  enabled: true
})

// Load data
async function loadData() {
  loadingFeeds.value = true
  try {
    const [settingsData, feedsData] = await Promise.all([
      $fetch('/api/admin/settings'),
      $fetch('/api/admin/feeds')
    ])
    
    fetchInterval.value = settingsData.fetchInterval || 60
    feeds.value = feedsData.feeds || []
  } catch (e) {
    alert('Failed to load data')
    console.error(e)
  } finally {
    loadingFeeds.value = false
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

function openFeedModal(feed?: any) {
  editingFeed.value = feed || null
  if (feed) {
    form.value = {
      name: feed.name,
      feed: feed.feed,
      baseUrl: feed.baseUrl,
      category: feed.category || '',
      enabled: feed.enabled !== false
    }
  } else {
    form.value = {
      name: '',
      feed: '',
      baseUrl: '',
      category: '',
      enabled: true
    }
  }
  showModal.value = true
}

async function saveFeed() {
  if (!form.value.name || !form.value.feed) {
    alert('Name and Feed URL are required')
    return
  }
  
  savingFeed.value = true
  try {
    await $fetch('/api/admin/feeds', {
      method: 'POST',
      body: {
        _id: editingFeed.value?._id,
        ...form.value
      }
    })
    
    await loadData()
    showModal.value = false
  } catch (e: any) {
    alert('Failed to save feed: ' + e.message)
  } finally {
    savingFeed.value = false
  }
}

async function deleteFeed(feed: any) {
  if (!confirm(`Are you sure you want to delete ${feed.name}?`)) return
  
  try {
    await $fetch(`/api/admin/feeds`, {
      method: 'DELETE',
      params: { id: feed._id }
    })
    await loadData()
  } catch (e) {
    alert('Failed to delete feed')
  }
}

onMounted(() => {
  loadData()
})
</script>
