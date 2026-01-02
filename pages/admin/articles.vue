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
              <p class="text-sm text-gray-500">Articles</p>
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
      <nav class="flex gap-1 mb-8 bg-white rounded-xl p-1 shadow-sm overflow-x-auto">
        <NuxtLink 
          to="/admin" 
          class="flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-gray-600 hover:bg-gray-100 whitespace-nowrap"
        >
          Dashboard
        </NuxtLink>
        <NuxtLink 
          to="/admin/articles" 
          class="flex items-center gap-2 px-4 py-2 rounded-lg font-medium bg-amber-500 text-white whitespace-nowrap"
        >
          Articles
        </NuxtLink>
        <NuxtLink 
          to="/admin/ads" 
          class="flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-gray-600 hover:bg-gray-100 whitespace-nowrap"
        >
          Ads
        </NuxtLink>
        <NuxtLink 
          to="/admin/settings" 
          class="flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-gray-600 hover:bg-gray-100 whitespace-nowrap"
        >
          Settings
        </NuxtLink>
      </nav>

      <!-- Action Buttons -->
      <div class="flex flex-wrap gap-3 mb-6">
        <NuxtLink 
          to="/admin/editor/new" 
          class="inline-flex items-center gap-2 px-4 py-2 bg-amber-500 text-white rounded-lg font-medium hover:bg-amber-600 transition-colors"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
          </svg>
          New Article
        </NuxtLink>
        <NuxtLink 
          to="/admin/editor/new?sponsored=true" 
          class="inline-flex items-center gap-2 px-4 py-2 bg-purple-500 text-white rounded-lg font-medium hover:bg-purple-600 transition-colors"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
          </svg>
          Sponsored Article
        </NuxtLink>
      </div>

      <!-- Filters -->
      <div class="bg-white rounded-xl p-4 shadow-sm mb-6">
        <div class="flex flex-wrap gap-4 items-center">
          <div class="flex-1 min-w-[200px]">
            <input 
              v-model="searchQuery" 
              type="search"
              placeholder="Search articles..."
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
            />
          </div>
          
          <select 
            v-model="categoryFilter"
            class="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
          >
            <option value="">All Categories</option>
            <option v-for="cat in CORE_CATEGORIES" :key="cat.id" :value="cat.id">
              {{ cat.emoji }} {{ cat.label }}
            </option>
          </select>
          
          <select 
            v-model="sortBy"
            class="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
          >
            <option value="createdAt">Newest First</option>
            <option value="score">Highest Score</option>
            <option value="title">Alphabetical</option>
          </select>
          
          <button 
            @click="deleteAllArticles"
            :disabled="deletingAll"
            class="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
          >
            {{ deletingAll ? 'Deleting...' : 'Delete All' }}
          </button>
        </div>
      </div>

      <!-- Articles Table -->
      <div class="bg-white rounded-xl shadow-sm overflow-hidden">
        <div v-if="pending" class="text-center py-12">
          <div class="w-8 h-8 border-4 border-amber-200 border-t-amber-500 rounded-full animate-spin mx-auto"></div>
          <p class="mt-4 text-gray-500">Loading articles...</p>
        </div>

        <div v-else-if="filteredArticles.length === 0" class="text-center py-12">
          <svg class="w-12 h-12 mx-auto text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <p class="mt-4 text-gray-500">No articles found</p>
        </div>

        <table v-else class="w-full">
          <thead class="bg-gray-50 border-b border-gray-200">
            <tr>
              <th class="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Article</th>
              <th class="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell">Category</th>
              <th class="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider hidden lg:table-cell">Source</th>
              <th class="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider hidden sm:table-cell">Score</th>
              <th class="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider hidden lg:table-cell">Date</th>
              <th class="text-right px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-100">
            <tr v-for="article in filteredArticles" :key="article._id" class="hover:bg-gray-50">
              <td class="px-6 py-4">
                <div class="max-w-xs">
                  <p class="font-medium text-gray-900 truncate">{{ article.title }}</p>
                  <p class="text-sm text-gray-500 truncate">{{ article.summary }}</p>
                </div>
              </td>
              <td class="px-6 py-4 hidden md:table-cell">
                <span :class="['px-2 py-1 rounded text-xs font-medium', getCategoryColor(article.category)]">
                  {{ getCategoryLabel(article.category) }}
                </span>
              </td>
              <td class="px-6 py-4 text-sm text-gray-500 hidden lg:table-cell">
                {{ article.originalSource }}
              </td>
              <td class="px-6 py-4 hidden sm:table-cell">
                <div class="flex items-center gap-2">
                  <div class="w-12 bg-gray-200 rounded-full h-2">
                    <div 
                      class="bg-amber-500 h-2 rounded-full" 
                      :style="{ width: `${article.score}%` }"
                    ></div>
                  </div>
                  <span class="text-sm text-gray-600">{{ article.score }}</span>
                </div>
              </td>
              <td class="px-6 py-4 text-sm text-gray-500 hidden lg:table-cell">
                {{ formatDate(article.createdAt) }}
              </td>
              <td class="px-6 py-4 text-right">
                <div class="flex items-center justify-end gap-2">
                  <NuxtLink 
                    :to="`/article/${article.slug}`"
                    class="p-2 text-gray-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg"
                    title="View"
                  >
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  </NuxtLink>
                  <NuxtLink 
                    :to="`/admin/editor/${article._id}`"
                    class="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg"
                    title="Edit"
                  >
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </NuxtLink>
                  <button 
                    @click="toggleFeatured(article)"
                    :class="[
                      'p-2 rounded-lg',
                      article.featured 
                        ? 'text-amber-500 bg-amber-50 hover:bg-amber-100' 
                        : 'text-gray-400 hover:text-amber-600 hover:bg-amber-50'
                    ]"
                    title="Toggle Featured"
                  >
                    <svg class="w-5 h-5" :fill="article.featured ? 'currentColor' : 'none'" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                    </svg>
                  </button>
                  <button 
                    @click="deleteArticle(article)"
                    class="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg"
                    title="Delete"
                  >
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>

        <!-- Pagination -->
        <div v-if="data?.pagination" class="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
          <p class="text-sm text-gray-500">
            Showing {{ filteredArticles.length }} of {{ data.pagination.total }} articles
          </p>
          <div class="flex gap-2">
            <button 
              @click="page--" 
              :disabled="page <= 1"
              class="px-3 py-1 border border-gray-300 rounded text-sm disabled:opacity-50 hover:bg-gray-50"
            >
              Previous
            </button>
            <button 
              @click="page++" 
              :disabled="!data.pagination.hasMore"
              class="px-3 py-1 border border-gray-300 rounded text-sm disabled:opacity-50 hover:bg-gray-50"
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Story } from '~/types'
import { CORE_CATEGORIES, CATEGORY_MAP } from '~/utils/constants'

const router = useRouter()

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

const searchQuery = ref('')
const categoryFilter = ref('')
const sortBy = ref('createdAt')
const page = ref(1)
const deletingAll = ref(false)

async function deleteAllArticles() {
  if (!confirm('Are you sure you want to delete ALL articles? This cannot be undone.')) return
  
  deletingAll.value = true
  try {
    const result = await $fetch('/api/admin/cleanup', {
      method: 'POST',
      body: { deleteAll: true },
    })
    alert(result.message)
    refresh()
  } catch (e) {
    alert('Failed to delete articles')
    console.error(e)
  } finally {
    deletingAll.value = false
  }
}

const { data, pending, refresh } = await useFetch('/api/stories', {
  query: computed(() => {
    const q: Record<string, any> = { page: page.value, limit: 20 }
    if (categoryFilter.value) {
      q.category = categoryFilter.value
    }
    return q
  }),
  watch: [categoryFilter, page],
})

const filteredArticles = computed(() => {
  let articles = data.value?.stories || []
  
  // Search filter
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    articles = articles.filter(a => 
      a.title.toLowerCase().includes(query) ||
      a.summary.toLowerCase().includes(query) ||
      a.originalSource.toLowerCase().includes(query)
    )
  }
  
  // Sort
  if (sortBy.value === 'score') {
    articles = [...articles].sort((a, b) => b.score - a.score)
  } else if (sortBy.value === 'title') {
    articles = [...articles].sort((a, b) => a.title.localeCompare(b.title))
  }
  
  return articles
})

function formatDate(date: string) {
  return new Date(date).toLocaleDateString('en-US', { 
    month: 'short', 
    day: 'numeric',
    year: 'numeric'
  })
}

function getCategoryColor(category: string) {
  const cat = CATEGORY_MAP[category]
  if (!cat) return 'bg-gray-100 text-gray-700'
  return `bg-${cat.twColor}-100 text-${cat.twColor}-700`
}

function getCategoryLabel(category: string) {
  const cat = CATEGORY_MAP[category]
  return cat ? cat.label : category
}

async function toggleFeatured(article: Story) {
  try {
    await $fetch(`/api/admin/articles/${article._id}`, {
      method: 'PATCH',
      body: { featured: !article.featured },
    })
    refresh()
  } catch (e) {
    alert('Failed to update article')
    console.error(e)
  }
}

async function deleteArticle(article: Story) {
  if (!confirm(`Delete "${article.title}"?`)) return
  
  try {
    await $fetch(`/api/admin/articles/${article._id}`, {
      method: 'DELETE',
    })
    refresh()
  } catch (e) {
    alert('Failed to delete article')
    console.error(e)
  }
}

useHead({
  title: 'Articles - BrightWire Admin',
})
</script>
