<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Header -->
    <header class="bg-white shadow-sm border-b border-gray-200">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 py-4">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-4">
            <NuxtLink to="/admin" class="text-gray-400 hover:text-gray-600">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
            </NuxtLink>
            <div>
              <h1 class="text-2xl font-bold text-gray-900">📧 Subscribers</h1>
              <p class="text-sm text-gray-500">Manage MailerLite subscribers</p>
            </div>
          </div>
        </div>
      </div>
    </header>

    <main class="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      <!-- Bulk Add Section -->
      <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
        <h2 class="text-lg font-semibold text-gray-900 mb-4">Bulk Add Subscribers</h2>
        
        <div class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Paste emails (one per line, or comma/space separated)
            </label>
            <textarea
              v-model="bulkEmails"
              rows="6"
              class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 font-mono text-sm"
              placeholder="email1@example.com&#10;email2@example.com&#10;email3@example.com"
            ></textarea>
          </div>
          
          <div class="flex items-center gap-4">
            <button
              @click="addBulkSubscribers"
              :disabled="!bulkEmails.trim() || bulkLoading"
              class="px-6 py-2.5 bg-amber-500 hover:bg-amber-600 text-white font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              <svg v-if="bulkLoading" class="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <span>{{ bulkLoading ? 'Adding...' : 'Add Subscribers' }}</span>
            </button>
            
            <span v-if="bulkEmails.trim()" class="text-sm text-gray-500">
              {{ parseEmails(bulkEmails).length }} email(s) detected
            </span>
          </div>
          
          <!-- Results -->
          <div v-if="bulkResult" class="mt-4 p-4 rounded-lg" :class="bulkResult.success ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'">
            <div class="flex items-start gap-3">
              <svg v-if="bulkResult.success" class="w-5 h-5 text-green-500 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <svg v-else class="w-5 h-5 text-red-500 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div class="flex-1">
                <p class="font-medium" :class="bulkResult.success ? 'text-green-800' : 'text-red-800'">
                  {{ bulkResult.success ? 'Import Complete' : 'Import Failed' }}
                </p>
                <div v-if="bulkResult.success" class="mt-2 text-sm text-green-700 space-y-1">
                  <p>✅ Added: {{ bulkResult.added }}</p>
                  <p>📝 Already subscribed: {{ bulkResult.existing }}</p>
                  <p v-if="bulkResult.failed > 0">❌ Failed: {{ bulkResult.failed }}</p>
                  <p v-if="bulkResult.invalid > 0">⚠️ Invalid emails: {{ bulkResult.invalid }}</p>
                </div>
                <p v-else class="mt-1 text-sm text-red-700">{{ bulkResult.message }}</p>
              </div>
              <button @click="bulkResult = null" class="text-gray-400 hover:text-gray-600">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Subscribers List -->
      <div class="bg-white rounded-xl shadow-sm border border-gray-200">
        <div class="px-6 py-4 border-b border-gray-200">
          <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div class="flex items-center gap-4">
              <h2 class="text-lg font-semibold text-gray-900">Subscriber List</h2>
              <span v-if="totalCount > 0" class="text-sm text-gray-500">({{ totalCount }} total)</span>
            </div>
            <div class="flex flex-wrap items-center gap-2 sm:gap-4">
              <div class="relative">
                <input
                  v-model="searchQuery"
                  @input="debouncedSearch"
                  type="text"
                  placeholder="Search by email..."
                  class="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 w-full sm:w-64"
                />
                <svg class="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <button
                @click="loadSubscribers"
                :disabled="loading"
                class="px-3 py-2 text-gray-600 hover:text-gray-900 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-2"
                title="Refresh"
              >
                <svg class="w-5 h-5" :class="{ 'animate-spin': loading }" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                <span class="hidden sm:inline">Refresh</span>
              </button>
              <button
                v-if="selectedIds.length > 0"
                @click="confirmBulkDelete"
                class="px-3 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg flex items-center gap-2"
              >
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                Delete ({{ selectedIds.length }})
              </button>
              <button
                v-if="subscribers.length > 0 || meta.total > 0"
                @click="confirmDeleteAll"
                class="px-3 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg flex items-center gap-2"
              >
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                <span class="hidden sm:inline">Delete All</span>
                <span class="sm:hidden">All</span>
              </button>
            </div>
          </div>
        </div>

        <!-- Loading -->
        <div v-if="loading && !subscribers.length" class="p-12 text-center">
          <div class="animate-spin w-8 h-8 border-4 border-amber-500 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p class="text-gray-500">Loading subscribers...</p>
        </div>

        <!-- Empty State -->
        <div v-else-if="!loading && !subscribers.length" class="p-12 text-center">
          <svg class="w-12 h-12 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
          <p class="text-gray-500">{{ searchQuery ? 'No subscribers found' : 'No subscribers yet' }}</p>
        </div>

        <!-- Table -->
        <div v-else class="overflow-x-auto">
          <table class="w-full">
            <thead class="bg-gray-50 border-b border-gray-200">
              <tr>
                <th class="px-6 py-3 text-left">
                  <input 
                    type="checkbox" 
                    :checked="isAllSelected"
                    @change="toggleSelectAll"
                    class="w-4 h-4 text-amber-500 border-gray-300 rounded focus:ring-amber-500"
                    title="Select all on this page"
                  />
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Subscribed</th>
                <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-200">
              <tr v-for="subscriber in subscribers" :key="subscriber.id" class="hover:bg-gray-50" :class="{ 'bg-amber-50': selectedIds.includes(subscriber.id) }">
                <td class="px-6 py-4">
                  <input 
                    type="checkbox" 
                    :checked="selectedIds.includes(subscriber.id)"
                    @change="toggleSelect(subscriber.id)"
                    class="w-4 h-4 text-amber-500 border-gray-300 rounded focus:ring-amber-500"
                  />
                </td>
                <td class="px-6 py-4">
                  <div class="text-sm font-medium text-gray-900">{{ subscriber.email }}</div>
                </td>
                <td class="px-6 py-4">
                  <span 
                    class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
                    :class="{
                      'bg-green-100 text-green-800': subscriber.status === 'active',
                      'bg-yellow-100 text-yellow-800': subscriber.status === 'unconfirmed',
                      'bg-red-100 text-red-800': subscriber.status === 'unsubscribed',
                      'bg-gray-100 text-gray-800': !['active', 'unconfirmed', 'unsubscribed'].includes(subscriber.status)
                    }"
                  >
                    {{ subscriber.status || 'unknown' }}
                  </span>
                </td>
                <td class="px-6 py-4 text-sm text-gray-500">
                  {{ formatDate(subscriber.subscribed_at || subscriber.created_at) }}
                </td>
                <td class="px-6 py-4 text-right">
                  <button
                    @click="confirmDelete(subscriber)"
                    class="text-red-600 hover:text-red-800 text-sm font-medium"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Pagination -->
        <div v-if="subscribers.length > 0" class="px-6 py-4 border-t border-gray-200 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p class="text-sm text-gray-500">
            Showing {{ subscribers.length }} subscribers{{ totalCount > 0 ? ` of ${totalCount} total` : '' }}
          </p>
          <div class="flex items-center gap-2">
            <button
              @click="goToPrev"
              :disabled="cursorHistory.length === 0 || loading"
              class="px-3 py-1.5 border border-gray-300 rounded-lg text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
            >
              Previous
            </button>
            <button
              @click="goToNext"
              :disabled="!pagination.hasNext || loading"
              class="px-3 py-1.5 border border-gray-300 rounded-lg text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </main>

    <!-- Delete Confirmation Modal -->
    <div v-if="deleteModal" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" @click.self="deleteModal = null">
      <div class="bg-white rounded-xl shadow-2xl max-w-md w-full p-6">
        <h3 class="text-lg font-semibold text-gray-900 mb-2">Delete Subscriber</h3>
        <p class="text-gray-600 mb-6">
          Are you sure you want to delete <strong>{{ deleteModal.email }}</strong>? This will remove them from MailerLite and they will no longer receive emails.
        </p>
        <div class="flex justify-end gap-3">
          <button
            @click="deleteModal = null"
            class="px-4 py-2 text-gray-600 hover:text-gray-800 font-medium"
          >
            Cancel
          </button>
          <button
            @click="deleteSubscriber"
            :disabled="deleting"
            class="px-4 py-2 bg-red-500 hover:bg-red-600 text-white font-medium rounded-lg disabled:opacity-50 flex items-center gap-2"
          >
            <svg v-if="deleting" class="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
            </svg>
            {{ deleting ? 'Deleting...' : 'Delete' }}
          </button>
        </div>
      </div>
    </div>

    <!-- Bulk Delete Confirmation Modal -->
    <div v-if="bulkDeleteModal" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" @click.self="bulkDeleteModal = false">
      <div class="bg-white rounded-xl shadow-2xl max-w-md w-full p-6">
        <h3 class="text-lg font-semibold text-gray-900 mb-2">Delete {{ selectedIds.length }} Subscribers</h3>
        <p class="text-gray-600 mb-6">
          Are you sure you want to delete <strong>{{ selectedIds.length }} subscribers</strong>? This will permanently remove them from MailerLite and they will no longer receive emails.
        </p>
        <div class="flex justify-end gap-3">
          <button
            @click="bulkDeleteModal = false"
            class="px-4 py-2 text-gray-600 hover:text-gray-800 font-medium"
          >
            Cancel
          </button>
          <button
            @click="bulkDeleteSubscribers"
            :disabled="bulkDeleting"
            class="px-4 py-2 bg-red-500 hover:bg-red-600 text-white font-medium rounded-lg disabled:opacity-50 flex items-center gap-2"
          >
            <svg v-if="bulkDeleting" class="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
            </svg>
            {{ bulkDeleting ? 'Deleting...' : `Delete ${selectedIds.length} Subscribers` }}
          </button>
        </div>
      </div>
    </div>

    <!-- Delete All Confirmation Modal -->
    <div v-if="deleteAllModal" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" @click.self="deleteAllModal = false">
      <div class="bg-white rounded-xl shadow-2xl max-w-md w-full p-6">
        <h3 class="text-lg font-semibold text-red-600 mb-2">⚠️ Delete ALL Subscribers</h3>
        <p class="text-gray-600 mb-4">
          This will permanently delete <strong>ALL {{ meta.total || 'your' }} subscribers</strong> from MailerLite. This action cannot be undone.
        </p>
        <div class="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <p class="text-red-800 text-sm">
            Type <strong>DELETE ALL</strong> to confirm:
          </p>
          <input
            v-model="deleteAllConfirmText"
            type="text"
            placeholder="DELETE ALL"
            class="mt-2 w-full px-3 py-2 border border-red-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
          />
        </div>
        <div class="flex justify-end gap-3">
          <button
            @click="deleteAllModal = false; deleteAllConfirmText = ''"
            class="px-4 py-2 text-gray-600 hover:text-gray-800 font-medium"
          >
            Cancel
          </button>
          <button
            @click="deleteAllSubscribers"
            :disabled="deletingAll || deleteAllConfirmText !== 'DELETE ALL'"
            class="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg disabled:opacity-50 flex items-center gap-2"
          >
            <svg v-if="deletingAll" class="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
            </svg>
            {{ deletingAll ? 'Deleting All...' : 'Delete All Subscribers' }}
          </button>
        </div>
      </div>
    </div>

    <!-- Toast -->
    <div v-if="toast.show" class="fixed bottom-4 right-4 z-50">
      <div 
        class="px-4 py-3 rounded-lg shadow-lg flex items-center gap-3"
        :class="{
          'bg-green-500 text-white': toast.type === 'success',
          'bg-red-500 text-white': toast.type === 'error',
        }"
      >
        <span>{{ toast.message }}</span>
        <button @click="toast.show = false" class="text-white/80 hover:text-white">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: false })

const subscribers = ref<any[]>([])
const meta = ref<any>({})
const totalCount = ref<number>(0) // Store total separately so it persists across pagination
const pagination = ref<any>({ hasNext: false, hasPrev: false, nextCursor: null, prevCursor: null })
const loading = ref(false)
const searchQuery = ref('')
const currentCursor = ref<string | null>(null)
const cursorHistory = ref<string[]>([]) // Track previous cursors for "Previous" button

const bulkEmails = ref('')
const bulkLoading = ref(false)
const bulkResult = ref<any>(null)

const deleteModal = ref<any>(null)
const deleting = ref(false)

// Multi-select state
const selectedIds = ref<string[]>([])
const bulkDeleteModal = ref(false)
const bulkDeleting = ref(false)

const isAllSelected = computed(() => {
  return subscribers.value.length > 0 && 
    subscribers.value.every(s => selectedIds.value.includes(s.id))
})

function toggleSelect(id: string) {
  const index = selectedIds.value.indexOf(id)
  if (index === -1) {
    selectedIds.value.push(id)
  } else {
    selectedIds.value.splice(index, 1)
  }
}

function toggleSelectAll() {
  if (isAllSelected.value) {
    selectedIds.value = []
  } else {
    selectedIds.value = subscribers.value.map(s => s.id)
  }
}

function confirmBulkDelete() {
  bulkDeleteModal.value = true
}

async function bulkDeleteSubscribers() {
  if (selectedIds.value.length === 0) return
  
  bulkDeleting.value = true
  try {
    const result = await $fetch('/api/admin/subscribers/bulk-delete', {
      method: 'POST',
      body: { ids: selectedIds.value }
    })
    
    showToast(`Deleted ${result.deleted} subscriber${result.deleted !== 1 ? 's' : ''}${result.failed > 0 ? `, ${result.failed} failed` : ''}`)
    bulkDeleteModal.value = false
    selectedIds.value = []
    loadSubscribers()
  } catch (e: any) {
    showToast(e.data?.message || 'Failed to delete subscribers', 'error')
  } finally {
    bulkDeleting.value = false
  }
}

// Delete All state
const deleteAllModal = ref(false)
const deleteAllConfirmText = ref('')
const deletingAll = ref(false)

function confirmDeleteAll() {
  deleteAllModal.value = true
  deleteAllConfirmText.value = ''
}

async function deleteAllSubscribers() {
  if (deleteAllConfirmText.value !== 'DELETE ALL') return
  
  deletingAll.value = true
  try {
    const result = await $fetch('/api/admin/subscribers/delete-all', {
      method: 'POST'
    })
    
    showToast(result.message)
    deleteAllModal.value = false
    deleteAllConfirmText.value = ''
    loadSubscribers()
  } catch (e: any) {
    showToast(e.data?.message || 'Failed to delete all subscribers', 'error')
  } finally {
    deletingAll.value = false
  }
}

const toast = ref({
  show: false,
  message: '',
  type: 'success' as 'success' | 'error'
})

function showToast(message: string, type: 'success' | 'error' = 'success') {
  toast.value = { show: true, message, type }
  setTimeout(() => {
    toast.value.show = false
  }, 5000)
}

function parseEmails(text: string): string[] {
  return text
    .split(/[\n,;\s]+/)
    .map(e => e.toLowerCase().trim())
    .filter(e => e.length > 0 && e.includes('@'))
}

async function loadSubscribers(cursor?: string | null) {
  loading.value = true
  selectedIds.value = [] // Clear selections
  try {
    const data = await $fetch('/api/admin/subscribers', {
      query: {
        cursor: cursor || undefined,
        limit: 50,
        search: searchQuery.value || undefined
      }
    })
    subscribers.value = data.subscribers
    meta.value = data.meta
    pagination.value = data.pagination || { hasNext: false, hasPrev: false }
    currentCursor.value = cursor || null
    
    // Update total count if provided (only on first page or search)
    if (data.meta?.total && data.meta.total > 0) {
      totalCount.value = data.meta.total
    }
  } catch (e: any) {
    showToast(e.data?.message || 'Failed to load subscribers', 'error')
  } finally {
    loading.value = false
  }
}

let searchTimeout: ReturnType<typeof setTimeout>
function debouncedSearch() {
  clearTimeout(searchTimeout)
  searchTimeout = setTimeout(() => {
    cursorHistory.value = []
    currentCursor.value = null
    totalCount.value = 0 // Reset total when searching
    loadSubscribers()
  }, 300)
}

function goToNext() {
  if (pagination.value.hasNext && pagination.value.nextCursor) {
    // Save current cursor to history for "Previous"
    if (currentCursor.value) {
      cursorHistory.value.push(currentCursor.value)
    } else {
      cursorHistory.value.push('') // Empty string for first page
    }
    loadSubscribers(pagination.value.nextCursor)
  }
}

function goToPrev() {
  if (cursorHistory.value.length > 0) {
    const prevCursor = cursorHistory.value.pop()
    loadSubscribers(prevCursor || null)
  }
}

async function addBulkSubscribers() {
  bulkLoading.value = true
  bulkResult.value = null
  
  try {
    const result = await $fetch('/api/admin/subscribers/bulk', {
      method: 'POST',
      body: { emails: bulkEmails.value }
    })
    bulkResult.value = result
    
    if (result.added > 0) {
      bulkEmails.value = ''
      loadSubscribers()
    }
  } catch (e: any) {
    bulkResult.value = {
      success: false,
      message: e.data?.message || 'Failed to add subscribers'
    }
  } finally {
    bulkLoading.value = false
  }
}

function confirmDelete(subscriber: any) {
  deleteModal.value = subscriber
}

async function deleteSubscriber() {
  if (!deleteModal.value) return
  
  deleting.value = true
  try {
    await $fetch(`/api/admin/subscribers/${deleteModal.value.id}`, {
      method: 'DELETE'
    })
    
    showToast('Subscriber deleted successfully')
    deleteModal.value = null
    loadSubscribers()
  } catch (e: any) {
    showToast(e.data?.message || 'Failed to delete subscriber', 'error')
  } finally {
    deleting.value = false
  }
}

function formatDate(dateStr: string): string {
  if (!dateStr) return '-'
  const date = new Date(dateStr)
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

// Check auth and load
onMounted(async () => {
  try {
    await $fetch('/api/admin/check')
    loadSubscribers()
  } catch {
    navigateTo('/admin/login')
  }
})
</script>
