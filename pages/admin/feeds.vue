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
          <div class="w-10 h-10 bg-gradient-to-br from-amber-500 to-orange-600 rounded-xl flex items-center justify-center">
            <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 5c7.18 0 13 5.82 13 13M6 11a7 7 0 017 7m-6 0a1 1 0 11-2 0 1 1 0 012 0z" />
            </svg>
          </div>
          <div>
            <h1 class="text-xl font-bold text-gray-900">Feed Manager</h1>
            <p class="text-xs text-gray-500">Manage RSS sources and content ingestion</p>
          </div>
        </div>
      </div>
    </header>

    <main class="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-8">
      <!-- Actions -->
      <div class="flex justify-end gap-3">
        <button
          @click="openImportModal"
          class="px-4 py-2 bg-white text-gray-700 border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors flex items-center gap-2"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
          </svg>
          Mass Import
        </button>
        <button
          @click="openFeedModal()"
          class="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
          </svg>
          Add Feed
        </button>
      </div>

      <!-- Feed List -->
      <div class="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div class="overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50">
              <tr>
                <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/4">Source Name</th>
                <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/3">Feed URL</th>
                <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th scope="col" class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              <tr v-if="loadingFeeds">
                <td colspan="4" class="px-6 py-12 text-center text-gray-500">
                  <svg class="w-8 h-8 mx-auto mb-2 text-gray-300 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Loading feeds...
                </td>
              </tr>
              <tr v-else-if="feeds.length === 0">
                <td colspan="4" class="px-6 py-12 text-center text-gray-500">
                  No feeds found. Add one to get started!
                </td>
              </tr>
              <tr v-for="feed in feeds" :key="feed._id" class="hover:bg-gray-50 transition-colors">
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="flex items-center">
                    <div class="flex-shrink-0 h-8 w-8 rounded bg-gray-100 flex items-center justify-center text-lg">
                      {{ getCategoryEmoji(feed.category) }}
                    </div>
                    <div class="ml-4">
                      <div class="text-sm font-medium text-gray-900">{{ feed.name }}</div>
                      <div class="text-xs text-gray-500">{{ feed.category || 'Auto-Detect' }}</div>
                    </div>
                  </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="text-sm text-gray-500 max-w-md truncate font-mono bg-gray-50 px-2 py-1 rounded" :title="feed.feed">
                    {{ feed.feed }}
                  </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <button 
                    @click="toggleFeed(feed)"
                    class="relative inline-flex flex-shrink-0 h-6 w-11 border-2 border-transparent rounded-full cursor-pointer transition-colors ease-in-out duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    :class="feed.enabled !== false ? 'bg-green-500' : 'bg-gray-200'"
                  >
                    <span 
                      aria-hidden="true" 
                      class="pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow transform ring-0 transition ease-in-out duration-200"
                      :class="feed.enabled !== false ? 'translate-x-5' : 'translate-x-0'"
                    ></span>
                  </button>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <div class="flex justify-end items-center gap-3">
                    <button @click="openFeedModal(feed)" class="text-blue-600 hover:text-blue-900 flex items-center gap-1">
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path></svg>
                      Edit
                    </button>
                    <button @click="deleteFeed(feed)" class="text-red-600 hover:text-red-900 flex items-center gap-1">
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </main>

    <!-- Add/Edit Feed Modal -->
    <div v-if="showModal" class="fixed inset-0 z-50 overflow-y-auto">
      <div class="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div class="fixed inset-0 transition-opacity" @click="showModal = false">
          <div class="absolute inset-0 bg-gray-900 opacity-50 backdrop-blur-sm"></div>
        </div>
        <div class="inline-block align-bottom bg-white rounded-xl text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg w-full">
          <div class="bg-gray-50 px-4 py-4 border-b border-gray-100 flex justify-between items-center">
            <h3 class="text-lg font-semibold text-gray-900">
              {{ editingFeed ? 'Edit Feed' : 'Add New Feed' }}
            </h3>
            <button @click="showModal = false" class="text-gray-400 hover:text-gray-600">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
            </button>
          </div>
          <div class="p-6 space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700">Source Name <span class="text-red-500">*</span></label>
              <input v-model="form.name" type="text" placeholder="e.g. CNN Tech" class="mt-1 block w-full border border-gray-300 rounded-lg shadow-sm py-2 px-3 focus:ring-amber-500 focus:border-amber-500 sm:text-sm">
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700">RSS/Atom Feed URL <span class="text-red-500">*</span></label>
              <input v-model="form.feed" type="text" placeholder="https://..." class="mt-1 block w-full border border-gray-300 rounded-lg shadow-sm py-2 px-3 focus:ring-amber-500 focus:border-amber-500 sm:text-sm">
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700">Base Website URL</label>
              <input v-model="form.baseUrl" type="text" placeholder="Optional" class="mt-1 block w-full border border-gray-300 rounded-lg shadow-sm py-2 px-3 focus:ring-amber-500 focus:border-amber-500 sm:text-sm">
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700">Category</label>
              <select v-model="form.category" class="mt-1 block w-full border border-gray-300 rounded-lg shadow-sm py-2 px-3 focus:ring-amber-500 focus:border-amber-500 sm:text-sm">
                  <option value="">Auto-Detect / Mixed</option>
                  <option v-for="cat in CORE_CATEGORIES" :key="cat.id" :value="cat.id">
                    {{ cat.emoji }} {{ cat.label }}
                  </option>
              </select>
            </div>
          </div>
          <div class="bg-gray-50 px-6 py-4 flex flex-row-reverse gap-2">
            <button 
              @click="saveFeed" 
              class="w-full inline-flex justify-center rounded-lg border border-transparent shadow-sm px-4 py-2 bg-amber-500 text-base font-medium text-white hover:bg-amber-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500 sm:w-auto sm:text-sm"
              :disabled="savingFeed"
            >
              {{ savingFeed ? 'Saving...' : 'Save Feed' }}
            </button>
            <button @click="showModal = false" class="mt-3 w-full inline-flex justify-center rounded-lg border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 sm:mt-0 sm:w-auto sm:text-sm">
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Mass Import Modal -->
    <div v-if="showImportModal" class="fixed inset-0 z-50 overflow-y-auto">
      <div class="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div class="fixed inset-0 transition-opacity" @click="showImportModal = false">
          <div class="absolute inset-0 bg-gray-900 opacity-50 backdrop-blur-sm"></div>
        </div>
        <div class="inline-block align-bottom bg-white rounded-xl text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl w-full">
          <div class="bg-gray-50 px-4 py-4 border-b border-gray-100 flex justify-between items-center">
            <h3 class="text-lg font-semibold text-gray-900">Mass / Setup Import</h3>
            <button @click="showImportModal = false" class="text-gray-400 hover:text-gray-600">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
            </button>
          </div>
          <div class="p-6">
            <p class="text-sm text-gray-600 mb-4">
              Paste your list directly below. We accept <strong>CSV, JSON, or Valid URL List</strong>.
              Format: <code>Name, URL, Category(optional)</code> usually works best.
            </p>
            <textarea
              v-model="importText"
              rows="12"
              class="w-full px-3 py-2 font-mono text-xs border border-gray-300 rounded-lg focus:ring-amber-500 focus:border-amber-500"
              placeholder="Good News Network, https://www.goodnewsnetwork.org/feed/
BBC Sport, https://feeds.bbci.co.uk/sport/rss.xml, sports
..."
            ></textarea>
          </div>
          <div class="bg-gray-50 px-6 py-4 flex flex-row-reverse gap-2">
            <button 
              @click="processImport" 
              class="w-full inline-flex justify-center rounded-lg border border-transparent shadow-sm px-4 py-2 bg-green-600 text-base font-medium text-white hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 sm:w-auto sm:text-sm"
              :disabled="importing"
            >
              {{ importing ? 'Importing...' : 'Process Import' }}
            </button>
            <button @click="showImportModal = false" class="mt-3 w-full inline-flex justify-center rounded-lg border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 sm:mt-0 sm:w-auto sm:text-sm">
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
import { CORE_CATEGORIES } from '~/utils/constants'

const loadingFeeds = ref(false)
const feeds = ref<any[]>([])
const showModal = ref(false)
const editingFeed = ref<any>(null)
const savingFeed = ref(false)

const showImportModal = ref(false)
const importText = ref('')
const importing = ref(false)

const form = ref({
  name: '',
  feed: '',
  baseUrl: '',
  category: '',
  enabled: true
})

function getCategoryEmoji(catId: string) {
  const cat = CORE_CATEGORIES.find(c => c.id === catId)
  return cat ? cat.emoji : '📰'
}

// Load data
async function loadFeeds() {
  loadingFeeds.value = true
  try {
    const data = await $fetch('/api/admin/feeds')
    feeds.value = data.feeds || []
  } catch (e) {
    alert('Failed to load feeds')
  } finally {
    loadingFeeds.value = false
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
    
    await loadFeeds()
    showModal.value = false
  } catch (e: any) {
    alert('Failed to save feed: ' + e.message)
  } finally {
    savingFeed.value = false
  }
}

async function toggleFeed(feed: any) {
  // Optimistic update
  feed.enabled = !feed.enabled
  try {
    await $fetch('/api/admin/feeds', {
      method: 'POST',
      body: {
        _id: feed._id,
        name: feed.name,
        feed: feed.feed,
        baseUrl: feed.baseUrl,
        category: feed.category,
        enabled: feed.enabled 
      }
    })
  } catch (e) {
    feed.enabled = !feed.enabled // Revert
    alert('Failed to update status')
  }
}

async function deleteFeed(feed: any) {
  if (!confirm(`Are you sure you want to delete ${feed.name}?`)) return
  
  try {
    await $fetch(`/api/admin/feeds`, {
      method: 'DELETE',
      params: { id: feed._id }
    })
    await loadFeeds()
  } catch (e) {
    alert('Failed to delete feed')
  }
}

function openImportModal() {
  importText.value = ''
  showImportModal.value = true
}

async function processImport() {
  if (!importText.value) return
  
  importing.value = true
  const lines = importText.value.split('\n').filter(l => l.trim().length > 0)
  
  let successCount = 0
  
  try {
    for (const line of lines) {
      // Basic CSV parsing: Name, URL, Category
      const parts = line.split(',').map(p => p.trim())
      if (parts.length >= 2) {
        const name = parts[0]
        const feed = parts[1]
        const category = parts[2] || '' // Optional
        
        try {
          await $fetch('/api/admin/feeds', {
            method: 'POST',
            body: {
              name,
              feed,
              baseUrl: new URL(feed).origin,
              category,
              enabled: true
            }
          })
          successCount++
        } catch (err) {
          console.error(`Failed to import line: ${line}`, err)
        }
      }
    }
    
    alert(`Imported ${successCount} feeds successfully!`)
    await loadFeeds()
    showImportModal.value = false
  } catch (e) {
    alert('Import failed')
  } finally {
    importing.value = false
  }
}

onMounted(() => {
  loadFeeds()
})
</script>
