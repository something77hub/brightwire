<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Toast Notification -->
    <Teleport to="body">
      <Transition
        enter-active-class="transition ease-out duration-300"
        enter-from-class="opacity-0 translate-y-2"
        enter-to-class="opacity-100 translate-y-0"
        leave-active-class="transition ease-in duration-200"
        leave-from-class="opacity-100 translate-y-0"
        leave-to-class="opacity-0 translate-y-2"
      >
        <div 
          v-if="toast.show" 
          class="fixed bottom-6 right-6 z-50 max-w-md"
        >
          <div 
            class="rounded-lg shadow-lg px-4 py-3 flex items-center gap-3"
            :class="{
              'bg-emerald-50 border border-emerald-200 text-emerald-800': toast.type === 'success',
              'bg-red-50 border border-red-200 text-red-800': toast.type === 'error',
              'bg-amber-50 border border-amber-200 text-amber-800': toast.type === 'info'
            }"
          >
            <!-- Icon -->
            <div class="flex-shrink-0">
              <svg v-if="toast.type === 'success'" class="w-5 h-5 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
              </svg>
              <svg v-else-if="toast.type === 'error'" class="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
              <svg v-else class="w-5 h-5 text-amber-500 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            </div>
            <!-- Message -->
            <p class="text-sm font-medium">{{ toast.message }}</p>
            <!-- Close button -->
            <button 
              @click="toast.show = false"
              class="flex-shrink-0 ml-2 text-gray-400 hover:text-gray-600"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      </Transition>
    </Teleport>

    <!-- Header -->
    <header class="bg-white border-b border-gray-200 sticky top-0 z-10">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex items-center justify-between h-16">
          <div class="flex items-center space-x-3">
            <div class="w-8 h-8 bg-gradient-to-br from-amber-400 to-orange-500 rounded-lg flex items-center justify-center">
              <svg class="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10 2a8 8 0 100 16 8 8 0 000-16zM8.5 9.5a1.5 1.5 0 113 0 1.5 1.5 0 01-3 0z"/>
              </svg>
            </div>
            <div>
              <h1 class="text-xl font-bold text-gray-900">Social Media</h1>
              <p class="text-xs text-gray-500">Share articles to social platforms</p>
            </div>
          </div>
          <NuxtLink to="/admin" class="text-gray-600 hover:text-gray-900">
            ← Back to Dashboard
          </NuxtLink>
        </div>
      </div>
    </header>

    <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <!-- Ayrshare Connection Status -->
      <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
        <div class="flex items-center justify-between">
          <div>
            <h2 class="text-lg font-semibold text-gray-900">Ayrshare Integration</h2>
            <p class="text-sm text-gray-500 mt-1">Connect to post directly to social media</p>
          </div>
          <div v-if="ayrshareConnected" class="flex items-center space-x-2">
            <span class="w-2 h-2 bg-green-500 rounded-full"></span>
            <span class="text-sm text-green-600 font-medium">Connected</span>
          </div>
          <div v-else class="flex items-center space-x-3">
            <input
              v-model="ayrshareApiKey"
              type="password"
              placeholder="Enter Ayrshare API Key"
              class="px-3 py-2 border border-gray-300 rounded-lg text-sm w-64"
            />
            <button
              @click="connectAyrshare"
              class="px-4 py-2 bg-amber-500 text-white rounded-lg text-sm font-medium hover:bg-amber-600"
            >
              Connect
            </button>
          </div>
        </div>
        
        <!-- Connected Platforms -->
        <div v-if="ayrshareConnected && connectedPlatforms.length > 0" class="mt-4 pt-4 border-t border-gray-100">
          <p class="text-sm text-gray-600 mb-2">Connected platforms:</p>
          <div class="flex flex-wrap gap-2">
            <span
              v-for="platform in connectedPlatforms"
              :key="platform"
              class="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm capitalize"
            >
              {{ platform }}
            </span>
          </div>
        </div>
      </div>

      <!-- Articles Selection -->
      <div class="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div class="px-6 py-4 border-b border-gray-200">
          <div class="flex items-center justify-between mb-4">
            <div>
              <h2 class="text-lg font-semibold text-gray-900">Select Articles to Share</h2>
              <p class="text-sm text-gray-500">{{ selectedArticles.length }} selected</p>
            </div>
            <div class="flex items-center space-x-3">
              <button
                v-if="selectedArticles.length > 0"
                @click="downloadSelected"
                :disabled="downloading"
                class="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200 flex items-center space-x-2"
              >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/>
                </svg>
                <span>{{ downloading ? 'Preparing...' : 'Download Package' }}</span>
              </button>
              <button
                v-if="selectedArticles.length > 0 && ayrshareConnected"
                @click="openPostModal"
                class="px-4 py-2 bg-amber-500 text-white rounded-lg text-sm font-medium hover:bg-amber-600 flex items-center space-x-2"
              >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"/>
                </svg>
                <span>Post to Social</span>
              </button>
            </div>
          </div>
          
          <!-- Search and Filter Bar -->
          <div class="flex items-center gap-3">
            <!-- Search Input -->
            <div class="flex-1 relative">
              <svg class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
              </svg>
              <input
                v-model="searchQuery"
                type="text"
                placeholder="Search articles by title..."
                class="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-amber-500 focus:border-amber-500"
              />
              <button
                v-if="searchQuery"
                @click="clearSearch"
                class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
                </svg>
              </button>
            </div>
            
            <!-- Category Filter -->
            <select
              v-model="filterCategory"
              @change="applyFilters"
              class="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-amber-500 focus:border-amber-500"
            >
              <option value="">All Categories</option>
              <option v-for="cat in CORE_CATEGORIES" :key="cat.id" :value="cat.id">
                {{ cat.emoji }} {{ cat.label }}
              </option>
            </select>
            
            <!-- Clear Filters -->
            <button
              v-if="searchQuery || filterCategory"
              @click="clearAllFilters"
              class="px-3 py-2 text-sm text-gray-600 hover:text-gray-900"
            >
              Clear
            </button>
          </div>
          
          <!-- Results count -->
          <div class="flex items-center gap-2 mt-2">
            <p v-if="loading" class="text-xs text-amber-600">
              Loading articles...
            </p>
            <p v-else class="text-xs text-gray-500">
              <span v-if="searchQuery || filterCategory">
                Found {{ filteredArticles.length }} of {{ articles.length }} articles
              </span>
              <span v-else>
                {{ articles.length }} articles loaded
              </span>
            </p>
          </div>
        </div>

        <!-- Select All Header -->
        <div class="px-4 py-2 bg-gray-50 border-b border-gray-200 flex items-center justify-between">
          <label class="flex items-center space-x-3 cursor-pointer">
            <div class="relative">
              <input
                ref="selectAllCheckbox"
                type="checkbox"
                :checked="isAllSelected"
                @change="toggleSelectAll"
                class="w-5 h-5 text-amber-500 border-gray-300 rounded focus:ring-amber-500"
              />
              <!-- Partial selection indicator -->
              <div 
                v-if="isPartiallySelected && !isAllSelected"
                class="absolute inset-0 flex items-center justify-center pointer-events-none"
              >
                <div class="w-2.5 h-0.5 bg-amber-500 rounded"></div>
              </div>
            </div>
            <span class="text-sm text-gray-700">
              <template v-if="selectedArticles.length === 0">Select all ({{ articles.length }})</template>
              <template v-else>{{ selectedArticles.length }} of {{ articles.length }} selected</template>
            </span>
          </label>
          <button
            v-if="selectedArticles.length > 0"
            @click="selectedArticles = []"
            class="text-xs text-gray-500 hover:text-gray-700"
          >
            Clear selection
          </button>
        </div>

        <!-- Articles List -->
        <div class="divide-y divide-gray-100 max-h-[600px] overflow-y-auto">
          <!-- Loading state -->
          <div v-if="loading && articles.length === 0" class="p-8 text-center">
            <svg class="w-8 h-8 text-amber-500 mx-auto mb-3 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <p class="text-gray-500">Loading articles...</p>
          </div>
          
          <!-- Empty state -->
          <div v-else-if="filteredArticles.length === 0" class="p-8 text-center">
            <svg class="w-12 h-12 text-gray-300 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
            </svg>
            <p class="text-gray-500">No articles found</p>
            <button @click="clearAllFilters" class="text-amber-600 text-sm mt-2 hover:underline">Clear filters</button>
          </div>
          <div
            v-for="article in filteredArticles"
            :key="article._id"
            class="p-4 hover:bg-gray-50 flex items-start space-x-4"
          >
            <input
              type="checkbox"
              :checked="selectedArticles.includes(article._id)"
              @change="toggleArticle(article._id)"
              class="mt-1 w-5 h-5 text-amber-500 border-gray-300 rounded focus:ring-amber-500"
            />
            <img
              v-if="article.imageUrl"
              :src="article.imageUrl"
              class="w-20 h-14 object-cover rounded-lg flex-shrink-0"
            />
            <div class="flex-1 min-w-0">
              <h3 class="text-sm font-medium text-gray-900 line-clamp-1">{{ article.title }}</h3>
              <p class="text-xs text-gray-500 mt-1 line-clamp-2">{{ article.summary }}</p>
              <div class="flex items-center space-x-3 mt-2">
                <span class="px-2 py-0.5 bg-gray-100 text-gray-600 rounded text-xs capitalize">{{ article.category }}</span>
                <span class="text-xs text-gray-400">{{ formatDate(article.publishedAt) }}</span>
              </div>
            </div>
            <button
              @click="previewArticle(article)"
              class="px-3 py-1 text-xs text-gray-500 hover:text-gray-700 border border-gray-200 rounded-lg"
            >
              Preview
            </button>
          </div>
        </div>

        <!-- Load More -->
        <div v-if="hasMore" class="px-6 py-4 border-t border-gray-200 text-center">
          <button
            @click="loadMore"
            :disabled="loading"
            class="text-amber-600 hover:text-amber-700 text-sm font-medium"
          >
            {{ loading ? 'Loading...' : 'Load More Articles' }}
          </button>
        </div>
      </div>
    </main>

    <!-- Post Modal -->
    <div v-if="showPostModal" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div class="bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-hidden">
        <div class="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <h3 class="text-lg font-semibold text-gray-900">Post to Social Media</h3>
          <button @click="showPostModal = false" class="text-gray-400 hover:text-gray-600">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
            </svg>
          </button>
        </div>
        
        <div class="p-6 overflow-y-auto max-h-[60vh]">
          <!-- Rate Limit Warning -->
          <div v-if="selectedArticles.length > 50" class="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
            <p class="text-sm text-amber-800">
              <strong>⚠️ {{ selectedArticles.length }} articles selected.</strong>
              To avoid rate limits, only the first 50 will be posted.
            </p>
          </div>
          
          <!-- Platform Selection -->
          <div class="mb-6">
            <label class="block text-sm font-medium text-gray-700 mb-2">Select Platforms</label>
            <div class="flex flex-wrap gap-2">
              <button
                v-for="platform in connectedPlatforms"
                :key="platform"
                @click="togglePlatform(platform)"
                :class="[
                  'px-4 py-2 rounded-lg text-sm font-medium border transition-colors',
                  selectedPlatforms.includes(platform)
                    ? 'bg-amber-500 text-white border-amber-500'
                    : 'bg-white text-gray-700 border-gray-300 hover:border-amber-500'
                ]"
              >
                {{ platform }}
              </button>
            </div>
          </div>

          <!-- Post Preview -->
          <div class="mb-6">
            <label class="block text-sm font-medium text-gray-700 mb-2">Post Caption</label>
            <textarea
              v-model="postCaption"
              rows="4"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
              placeholder="Caption will be auto-generated..."
            ></textarea>
          </div>

          <!-- Hashtags -->
          <div class="mb-6">
            <div class="flex items-center justify-between mb-2">
              <label class="block text-sm font-medium text-gray-700">Hashtags</label>
              <button 
                @click="regenerateHashtags"
                class="text-xs text-amber-600 hover:text-amber-700 flex items-center gap-1"
                title="Regenerate optimized hashtags"
              >
                <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Regenerate
              </button>
            </div>
            <input
              v-model="postHashtags"
              type="text"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
              placeholder="#GoodNews #PositiveVibes"
            />
          </div>

          <!-- Schedule Option -->
          <div class="mb-6">
            <label class="flex items-center space-x-2">
              <input
                v-model="schedulePost"
                type="checkbox"
                class="w-4 h-4 text-amber-500 border-gray-300 rounded focus:ring-amber-500"
              />
              <span class="text-sm text-gray-700">Schedule for later</span>
            </label>
            <input
              v-if="schedulePost"
              v-model="scheduleTime"
              type="datetime-local"
              class="mt-2 w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
            />
          </div>
        </div>

        <div class="px-6 py-4 border-t border-gray-200 flex justify-end space-x-3">
          <button
            @click="showPostModal = false"
            class="px-4 py-2 text-gray-700 hover:text-gray-900 text-sm font-medium"
          >
            Cancel
          </button>
          <button
            @click="postToSocial"
            :disabled="selectedPlatforms.length === 0"
            class="px-6 py-2 bg-amber-500 text-white rounded-lg text-sm font-medium hover:bg-amber-600 disabled:opacity-50"
          >
            Post {{ Math.min(selectedArticles.length, 50) }} Article{{ Math.min(selectedArticles.length, 50) === 1 ? '' : 's' }}
          </button>
        </div>
      </div>
    </div>

    <!-- Preview Modal -->
    <div v-if="previewingArticle" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div class="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
        <div class="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <h3 class="text-lg font-semibold text-gray-900">Social Post Preview</h3>
          <button @click="previewingArticle = null" class="text-gray-400 hover:text-gray-600">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
            </svg>
          </button>
        </div>
        
        <div class="p-6 overflow-y-auto max-h-[70vh]">
          <img
            v-if="previewingArticle.imageUrl"
            :src="previewingArticle.imageUrl"
            class="w-full h-64 object-cover rounded-lg mb-4"
          />
          <div class="bg-gray-50 rounded-lg p-4">
            <p class="text-sm text-gray-800 whitespace-pre-wrap">{{ generateCaption(previewingArticle) }}</p>
            <p class="text-sm text-amber-600 mt-2">{{ generateHashtags(previewingArticle) }}</p>
            <p class="text-sm text-blue-600 mt-2">🔗 Read more: {{ getSiteUrl() }}/article/{{ previewingArticle.slug }}</p>
          </div>
          
          <!-- Quote Card Button -->
          <div class="mt-4 pt-4 border-t border-gray-200">
            <button
              @click="openQuoteCard(previewingArticle)"
              class="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-purple-500 hover:bg-purple-600 text-white rounded-xl font-medium transition-colors"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              Create Quote Card
            </button>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Quote Card Modal -->
    <div v-if="showQuoteCardModal" class="fixed inset-0 z-50 overflow-y-auto bg-black/50" @click.self="showQuoteCardModal = false">
      <div class="flex min-h-screen items-center justify-center p-4">
        <div class="w-full max-w-3xl transform rounded-2xl bg-white shadow-2xl transition-all max-h-[80vh] flex flex-col">
        <div class="px-6 py-4 border-b border-gray-200 flex items-center justify-between bg-white z-10 rounded-t-2xl flex-shrink-0">
          <h3 class="text-lg font-semibold text-gray-900">Create Quote Card</h3>
          <button @click="showQuoteCardModal = false" class="text-gray-400 hover:text-gray-600">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
            </svg>
          </button>
        </div>
        
        <div class="p-6 overflow-y-auto flex-1">
          <!-- Article Info -->
          <div v-if="quoteCardArticle" class="mb-4 p-3 bg-gray-50 rounded-lg">
            <p class="text-sm font-medium text-gray-900">{{ quoteCardArticle.title }}</p>
            <p class="text-xs text-gray-500 mt-1">{{ quoteCardArticle.category }}</p>
          </div>
          
          <!-- Quote Input -->
          <div class="mb-4">
            <label class="block text-sm font-medium text-gray-700 mb-2">Quote Text</label>
            <textarea
              v-model="quoteCardText"
              rows="3"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
              placeholder="Enter a compelling quote from the article..."
            ></textarea>
            <p class="text-xs text-gray-500 mt-1">Tip: Use the article summary or a key sentence</p>
          </div>
          
          <!-- Quick Options -->
          <div class="mb-4">
            <label class="block text-sm font-medium text-gray-700 mb-2">Quick Options</label>
            <div class="flex flex-wrap gap-2">
              <button 
                @click="quoteCardText = quoteCardArticle?.title || ''"
                class="px-3 py-1.5 text-xs bg-purple-100 hover:bg-purple-200 text-purple-800 rounded-lg transition-colors"
              >
                Use Title
              </button>
              <button 
                @click="quoteCardText = quoteCardArticle?.summary || ''"
                class="px-3 py-1.5 text-xs bg-purple-100 hover:bg-purple-200 text-purple-800 rounded-lg transition-colors"
              >
                Use Summary
              </button>
            </div>
          </div>
          
          <!-- Background Option -->
          <div class="mb-4">
            <label class="block text-sm font-medium text-gray-700 mb-2">Background</label>
            <div class="flex gap-3">
              <button
                @click="quoteCardUseBackground = false"
                class="flex-1 px-4 py-3 border-2 rounded-xl text-sm font-medium transition-colors"
                :class="!quoteCardUseBackground ? 'border-purple-500 bg-purple-50 text-purple-700' : 'border-gray-200 text-gray-600 hover:border-gray-300'"
              >
                <span class="block text-lg mb-1">🎨</span>
                Solid Color
              </button>
              <button
                @click="quoteCardUseBackground = true"
                :disabled="!quoteCardArticle?.imageUrl"
                class="flex-1 px-4 py-3 border-2 rounded-xl text-sm font-medium transition-colors disabled:opacity-50"
                :class="quoteCardUseBackground ? 'border-purple-500 bg-purple-50 text-purple-700' : 'border-gray-200 text-gray-600 hover:border-gray-300'"
              >
                <span class="block text-lg mb-1">🖼️</span>
                Hero Image
              </button>
            </div>
          </div>
          
          <!-- Preview -->
          <div class="mb-4">
            <label class="block text-sm font-medium text-gray-700 mb-2">Preview</label>
            <div class="border border-gray-200 rounded-lg overflow-hidden bg-gray-50">
              <img 
                v-if="quoteCardText"
                :src="quoteCardUrl"
                alt="Quote card preview"
                class="w-full max-h-64 object-contain"
              />
              <div v-else class="py-12 text-center text-gray-400">
                Enter a quote to see preview
              </div>
            </div>
          </div>
          
          <!-- Download Buttons -->
          <div class="flex flex-wrap gap-3">
            <button 
              @click="downloadQuoteCardAsPng"
              :disabled="!quoteCardText"
              class="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-purple-500 hover:bg-purple-600 text-white rounded-xl font-medium transition-colors disabled:opacity-50"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              Download
            </button>
            <button 
              @click="shareQuoteCardToTwitter"
              :disabled="!quoteCardText"
              class="px-4 py-2.5 bg-black hover:bg-gray-800 text-white rounded-xl font-medium transition-colors disabled:opacity-50"
              title="Share to X/Twitter"
            >
              <svg class="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
              </svg>
            </button>
            <button 
              @click="shareQuoteCardToWhatsApp"
              :disabled="!quoteCardText"
              class="px-4 py-2.5 bg-[#25D366] hover:bg-[#20BD5A] text-white rounded-xl font-medium transition-colors disabled:opacity-50"
              title="Share to WhatsApp"
            >
              <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
              </svg>
            </button>
            <button 
              @click="copyQuoteCardUrl"
              :disabled="!quoteCardText"
              class="px-4 py-2.5 bg-gray-500 hover:bg-gray-600 text-white rounded-xl font-medium transition-colors disabled:opacity-50"
              title="Copy URL"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { CORE_CATEGORIES } from '~/utils/constants'

definePageMeta({ layout: false })

const articles = ref<any[]>([])
const selectedArticles = ref<string[]>([])
const loading = ref(false)
const downloading = ref(false)
const page = ref(1)
const hasMore = ref(true)

// Search and filter
const searchQuery = ref('')
const filterCategory = ref('')

// Toast notification
const toast = ref({
  show: false,
  message: '',
  type: 'success' as 'success' | 'error' | 'info'
})

function showToast(message: string, type: 'success' | 'error' | 'info' = 'success') {
  toast.value = { show: true, message, type }
  // Show for 30 seconds for success/error, shorter for info (loading states)
  const duration = type === 'info' ? 60000 : 30000
  setTimeout(() => {
    toast.value.show = false
  }, duration)
}

// Ayrshare
const ayrshareApiKey = ref('')
const ayrshareConnected = ref(false)
const connectedPlatforms = ref<string[]>([])

// Post modal
const showPostModal = ref(false)
const selectedPlatforms = ref<string[]>([])
const postCaption = ref('')
const postHashtags = ref('')
const schedulePost = ref(false)
const scheduleTime = ref('')

// Preview
const previewingArticle = ref<any>(null)

// Quote Card
const showQuoteCardModal = ref(false)
const quoteCardArticle = ref<any>(null)
const quoteCardText = ref('')
const quoteCardUseBackground = ref(false)

const quoteCardUrl = computed(() => {
  if (!quoteCardText.value || !quoteCardArticle.value) return ''
  const params = new URLSearchParams({
    quote: quoteCardText.value,
    source: quoteCardArticle.value.originalSource || 'BrightWire',
    category: quoteCardArticle.value.category || 'good-news'
  })
  
  if (quoteCardUseBackground.value && quoteCardArticle.value.imageUrl) {
    params.set('bg', quoteCardArticle.value.imageUrl)
  }
  
  return `/api/quote-card.png?${params.toString()}`
})

function openQuoteCard(article: any) {
  quoteCardArticle.value = article
  quoteCardText.value = article.summary || article.title || ''
  quoteCardUseBackground.value = false
  showQuoteCardModal.value = true
}

function shareQuoteCardToWhatsApp() {
  if (!quoteCardArticle.value) return
  const articleUrl = `${getSiteUrl()}/article/${quoteCardArticle.value.slug}`
  const text = `"${quoteCardText.value}"\n\n🌟 Read more: ${articleUrl}`
  window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank')
}

function shareQuoteCardToTwitter() {
  if (!quoteCardArticle.value) return
  const articleUrl = `${getSiteUrl()}/article/${quoteCardArticle.value.slug}`
  // Truncate quote for Twitter if needed
  const maxQuoteLength = 200
  const truncatedQuote = quoteCardText.value.length > maxQuoteLength 
    ? quoteCardText.value.slice(0, maxQuoteLength - 3) + '...'
    : quoteCardText.value
  const text = `"${truncatedQuote}"\n\n🌟 ${articleUrl}`
  window.open(
    `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`,
    '_blank',
    'width=550,height=420'
  )
}

async function copyQuoteCardUrl() {
  if (!quoteCardUrl.value) return
  try {
    await navigator.clipboard.writeText(window.location.origin + quoteCardUrl.value)
    showToast('Quote card URL copied!', 'success')
  } catch (e) {
    showToast('Failed to copy URL', 'error')
  }
}

async function downloadQuoteCardAsPng() {
  if (!quoteCardUrl.value) return
  
  try {
    // Create an image from the SVG
    const img = new Image()
    img.crossOrigin = 'anonymous'
    
    await new Promise((resolve, reject) => {
      img.onload = resolve
      img.onerror = reject
      img.src = quoteCardUrl.value
    })
    
    // Draw to canvas
    const canvas = document.createElement('canvas')
    canvas.width = 1200
    canvas.height = 630
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    
    ctx.drawImage(img, 0, 0, 1200, 630)
    
    // Download as PNG
    const link = document.createElement('a')
    link.download = `brightwire-quote-${Date.now()}.png`
    link.href = canvas.toDataURL('image/png')
    link.click()
    
    showToast('PNG downloaded!', 'success')
  } catch (e) {
    console.error('Failed to download PNG:', e)
    // Fallback: open SVG in new tab
    window.open(quoteCardUrl.value, '_blank')
    showToast('Opened in new tab - right-click to save as PNG', 'info')
  }
}

// Load articles
async function loadArticles(loadAll = false) {
  loading.value = true
  try {
    const query: Record<string, any> = { 
      page: page.value, 
      limit: loadAll ? 200 : 50
    }
    
    // If category filter is set, use server-side filtering
    if (filterCategory.value) {
      query.category = filterCategory.value
    }
    
    const data = await $fetch('/api/stories', { query })
    if (page.value === 1) {
      articles.value = data.stories
    } else {
      articles.value.push(...data.stories)
    }
    hasMore.value = data.pagination.hasMore
    
    // Auto-load all remaining articles for search
    if (loadAll && hasMore.value) {
      page.value++
      await loadArticles(true)
    }
  } catch (e) {
    console.error('Failed to load articles:', e)
  } finally {
    loading.value = false
  }
}

function loadMore() {
  page.value++
  loadArticles()
}

// Filtered articles based on search and category
const filteredArticles = computed(() => {
  let result = articles.value
  
  // Filter by search query
  if (searchQuery.value.trim()) {
    const query = searchQuery.value.toLowerCase().trim()
    result = result.filter(article => 
      article.title?.toLowerCase().includes(query) ||
      article.summary?.toLowerCase().includes(query) ||
      article.tags?.some((tag: string) => tag.toLowerCase().includes(query))
    )
  }
  
  // Filter by category
  if (filterCategory.value) {
    result = result.filter(article => article.category === filterCategory.value)
  }
  
  return result
})

// Apply filters (called on category change)
function applyFilters() {
  // Reset pagination and reload with new category filter
  page.value = 1
  loadArticles(true)  // Load all for search
}

// Clear search
function clearSearch() {
  searchQuery.value = ''
}

// Clear all filters
function clearAllFilters() {
  searchQuery.value = ''
  filterCategory.value = ''
  page.value = 1
  loadArticles(true)  // Load all for search
}

// Toggle selection
function toggleArticle(id: string) {
  const idx = selectedArticles.value.indexOf(id)
  if (idx > -1) {
    selectedArticles.value.splice(idx, 1)
  } else {
    selectedArticles.value.push(id)
  }
}

// Select all computed properties
const isAllSelected = computed(() => {
  if (articles.value.length === 0) return false
  return articles.value.every(article => selectedArticles.value.includes(article._id))
})

const isPartiallySelected = computed(() => {
  if (articles.value.length === 0) return false
  const selectedCount = articles.value.filter(article => selectedArticles.value.includes(article._id)).length
  return selectedCount > 0 && selectedCount < articles.value.length
})

// Toggle select all (selects ALL articles, not just filtered)
function toggleSelectAll() {
  if (isAllSelected.value) {
    // Deselect all
    selectedArticles.value = []
  } else {
    // Select all articles
    selectedArticles.value = articles.value.map(a => a._id)
  }
}

function togglePlatform(platform: string) {
  const idx = selectedPlatforms.value.indexOf(platform)
  if (idx > -1) {
    selectedPlatforms.value.splice(idx, 1)
  } else {
    selectedPlatforms.value.push(platform)
  }
}

// Generate caption from article - FULL version for Instagram/Facebook
// FORMAT: Title first, then summary
function generateCaption(article: any): string {
  const title = article.title || ''
  const summary = article.summary || ''
  
  // TITLE FIRST, then summary
  const caption = `📰 ${title}\n\n${summary}`
  
  console.log('[generateCaption] Title:', title)
  console.log('[generateCaption] Output:', caption.slice(0, 100))
  
  return caption
}

// Generate caption for Twitter
// Twitter/X Premium = 4000 character limit
function generateTwitterCaption(article: any, url: string): string {
  const title = article.title || ''
  const summary = article.summary || ''
  
  // With Premium, we can use more content
  // Leave room for hashtags (~100) and URL (~30) = ~3800 chars for content
  const maxTextLength = 800 // Use ~800 chars for engaging but not too long posts
  
  let text = `📰 ${title}`
  
  // Add full summary with Premium limits
  if (summary) {
    const remainingSpace = maxTextLength - text.length - 5
    if (remainingSpace > 50) {
      const summaryText = summary.slice(0, remainingSpace)
      text = `${text}\n\n${summaryText}${summary.length > remainingSpace ? '...' : ''}`
    }
  }
  
  if (text.length > maxTextLength) {
    text = text.slice(0, maxTextLength - 3) + '...'
  }
  
  return text
}

// Generate hashtags - full version for Instagram
function generateHashtags(article: any): string {
  const tags = article.tags || []
  const category = article.category || 'good-news'
  
  // Core branded + viral reach hashtags
  const coreViral = ['#GoodNews', '#PositiveNews', '#BrightWire', '#viral', '#trending', '#explorepage']
  
  // High-engagement general hashtags
  const engagement = ['#instagood', '#explore', '#fyp', '#news', '#dailynews']
  
  // Category-specific hashtags
  const categoryTags: Record<string, string[]> = {
    'heroes': ['#Hero', '#Inspiration', '#HumanityRestored', '#Community', '#RealHeroes', '#MakingADifference', '#BeTheChange'],
    'planet': ['#ClimateAction', '#Environment', '#Sustainability', '#Nature', '#EcoFriendly', '#GreenFuture', '#SaveThePlanet', '#ClimateHope'],
    'innovation': ['#Innovation', '#Technology', '#TechNews', '#Science', '#Future', '#AI', '#Breaking', '#Discovery', '#STEM'],
    'solutions': ['#Solutions', '#Progress', '#SocialGood', '#Impact', '#ChangeTheWorld', '#SocialImpact', '#PolicyWins'],
    'kindness': ['#Kindness', '#BeKind', '#SpreadLove', '#Humanity', '#Heartwarming', '#FeelGood', '#RestoreFaith'],
    'good-news': ['#UpliftingNews', '#Hope', '#Inspiration', '#FeelGoodFriday', '#GoodVibesOnly', '#PositiveVibes', '#HappyNews'],
  }
  
  // Day-of-week hashtags
  const dayTags: Record<number, string[]> = {
    0: ['#SundayVibes', '#SundayMood'],
    1: ['#MondayMotivation', '#MondayMood'],
    2: ['#TuesdayThoughts', '#TuesdayVibes'],
    3: ['#WednesdayWisdom', '#HumpDay'],
    4: ['#ThursdayThoughts', '#ThursdayMotivation'],
    5: ['#FridayFeeling', '#FeelGoodFriday', '#TGIF'],
    6: ['#SaturdayVibes', '#WeekendVibes'],
  }
  
  const today = new Date().getDay()
  const todayTags = dayTags[today] || []
  const catTags = categoryTags[category] || categoryTags['good-news']
  
  // Article-specific tags
  const articleTags = tags.slice(0, 5).map((t: string) => {
    const cleaned = t.replace(/[^a-zA-Z0-9]/g, '')
    return cleaned ? `#${cleaned}` : ''
  }).filter(Boolean)
  
  // Full set for Instagram (up to 15)
  const allTags = [
    ...coreViral.slice(0, 4),
    ...catTags.slice(0, 4),
    ...todayTags.slice(0, 1),
    ...engagement.slice(0, 2),
    ...articleTags.slice(0, 4)
  ]
  
  return [...new Set(allTags)].slice(0, 15).join(' ')
}

// Generate SHORT hashtags for Twitter (3-4 only)
function generateTwitterHashtags(article: any): string {
  const category = article.category || 'good-news'
  const tags = article.tags || []
  
  const categoryTag: Record<string, string> = {
    'heroes': '#Heroes',
    'planet': '#ClimateAction',
    'innovation': '#Innovation',
    'solutions': '#Solutions',
    'kindness': '#Kindness',
    'good-news': '#GoodNews',
  }
  
  const base = ['#GoodNews', '#BrightWire']
  const cat = categoryTag[category] || '#GoodNews'
  
  // One article tag if available
  const articleTag = tags[0] ? `#${tags[0].replace(/[^a-zA-Z0-9]/g, '')}` : ''
  
  const twitterTags = [...base, cat]
  if (articleTag && !twitterTags.includes(articleTag)) {
    twitterTags.push(articleTag)
  }
  
  return [...new Set(twitterTags)].slice(0, 4).join(' ')
}

function getSiteUrl(): string {
  return 'https://www.brightwire.news'
}

// Download selected articles as package
async function downloadSelected() {
  downloading.value = true
  try {
    const selected = articles.value.filter(a => selectedArticles.value.includes(a._id))
    
    // Use native fetch for blob response
    const response = await fetch('/api/admin/social/download', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ articleIds: selectedArticles.value }),
      credentials: 'include'
    })
    
    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || 'Failed to download')
    }
    
    // Get the blob (zip file)
    const blob = await response.blob()
    
    // Create download link
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `brightwire-social-${Date.now()}.zip`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    window.URL.revokeObjectURL(url)
    
    alert(`✅ Downloaded ${selected.length} articles with images for social media`)
  } catch (e: any) {
    alert('Failed to download: ' + (e.message || 'Unknown error'))
  } finally {
    downloading.value = false
  }
}

// Connect to Ayrshare
async function connectAyrshare() {
  try {
    const response = await $fetch('/api/admin/social/connect', {
      method: 'POST',
      body: { apiKey: ayrshareApiKey.value }
    })
    
    if (response.success) {
      ayrshareConnected.value = true
      connectedPlatforms.value = response.platforms || []
      alert('✅ Connected to Ayrshare!')
    }
  } catch (e: any) {
    alert('Failed to connect: ' + (e.data?.message || e.message))
  }
}

// Open post modal and reset fields
async function openPostModal() {
  // Clear any previous caption/hashtags
  postCaption.value = ''
  postHashtags.value = ''
  schedulePost.value = false
  scheduleTime.value = ''
  showPostModal.value = true
  
  // Auto-generate tags from API if we have articles
  if (selectedArticles.value.length > 0) {
    const firstArticle = articles.value.find(a => a._id === selectedArticles.value[0])
    if (firstArticle) {
      // Use article tags first if available
      postHashtags.value = 'Generating best tags...'
      try {
        const tags = await $fetch('/api/admin/social/tags', {
          method: 'POST',
          body: { article: firstArticle }
        })
        postHashtags.value = tags.instagram // Default to Instagram/Viral set
      } catch (e) {
        console.error('Failed to generate tags:', e)
        postHashtags.value = '#GoodNews #BrightWire' // Fallback
      }
    }
  }
}

async function regenerateHashtags() {
  if (selectedArticles.value.length === 0) return
  
  const firstArticle = articles.value.find(a => a._id === selectedArticles.value[0])
  if (!firstArticle) return
    
  postHashtags.value = 'Generating...'
  try {
    const tags = await $fetch('/api/admin/social/tags', {
      method: 'POST',
      body: { article: firstArticle }
    })
    postHashtags.value = tags.instagram
  } catch (e) {
    postHashtags.value = '#GoodNews #BrightWire'
  }
}

// Post to social media
const POST_LIMIT = 50 // Paid plan - higher limit

async function postToSocial() {
  if (selectedPlatforms.value.length === 0) {
    alert('Please select at least one platform')
    return
  }
  
  // Get selected articles before closing modal
  let selected = articles.value.filter(a => selectedArticles.value.includes(a._id))
  
  // Warn if too many articles selected
  if (selected.length > POST_LIMIT) {
    const proceed = confirm(
      `You're about to post ${selected.length} articles.\n\n` +
      `To avoid rate limits, we'll post the first ${POST_LIMIT} articles.\n\n` +
      `Continue?`
    )
    if (!proceed) return
    selected = selected.slice(0, POST_LIMIT)
  }
  
  const platforms = [...selectedPlatforms.value]
  const caption = postCaption.value
  const hashtags = postHashtags.value
  const isScheduled = schedulePost.value
  const scheduledTime = scheduleTime.value
  
  // Close modal immediately
  showPostModal.value = false
  selectedArticles.value = []
  
  // Show info toast
  showToast(`Posting ${selected.length} articles to ${platforms.join(', ')}...`, 'info')
  
  // Run posting in background with delay between posts to avoid rate limits
  let successCount = 0
  let errorCount = 0
  
  for (const article of selected) {
    try {
      const url = `${getSiteUrl()}/article/${article.slug}`
      
      // Separate Twitter from other platforms
      const twitterPlatforms = platforms.filter(p => p.toLowerCase() === 'twitter')
      const otherPlatforms = platforms.filter(p => p.toLowerCase() !== 'twitter')
      
      // Post to Twitter with Premium format (4000 char limit)
      if (twitterPlatforms.length > 0) {
        const twitterHashtags = generateTwitterHashtags(article)
        
        // Twitter/X Premium = 4000 character limit
        const availableChars = 4000
        
        // Calculate space for caption
        const urlPart = `🔗 ${url}`
        const fixedLength = twitterHashtags.length + urlPart.length + 4
        const maxCaptionLength = availableChars - fixedLength - 5
        
        let twitterCaption = caption 
          ? caption.slice(0, maxCaptionLength) 
          : generateTwitterCaption(article, url)
        
        if (twitterCaption.length > maxCaptionLength) {
          twitterCaption = twitterCaption.slice(0, maxCaptionLength - 3) + '...'
        }
        
        const twitterPost = `${twitterCaption}\n\n${twitterHashtags}\n\n${urlPart}`
        
        await $fetch('/api/admin/social/post', {
          method: 'POST',
          body: {
            post: twitterPost,
            platforms: twitterPlatforms,
            mediaUrl: article.imageUrl,
            scheduleDate: isScheduled ? scheduledTime : null
          }
        })
      }
      
      // Post to Instagram/other platforms with full format
      if (otherPlatforms.length > 0) {
        const fullCaption = caption || generateCaption(article)
        const fullHashtags = hashtags || generateHashtags(article)
        const fullPost = `${fullCaption}\n\n${fullHashtags}\n\n🔗 Read more: ${url}`
        
        // Debug log to verify format
        console.log('[Social Debug] Article title:', article.title)
        console.log('[Social Debug] Article summary:', article.summary?.slice(0, 50))
        console.log('[Social Debug] Generated caption:', fullCaption.slice(0, 100))
        console.log('[Social Debug] Full post preview:', fullPost.slice(0, 200))
        
        await $fetch('/api/admin/social/post', {
          method: 'POST',
          body: {
            post: fullPost,
            platforms: otherPlatforms,
            mediaUrl: article.imageUrl,
            scheduleDate: isScheduled ? scheduledTime : null
          }
        })
      }
      
      successCount++
      
      // Add delay between posts to avoid rate limits (1 second for paid plan)
      if (selected.indexOf(article) < selected.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 1000))
      }
    } catch (e: any) {
      console.error(`Failed to post article: ${article.title}`, e)
      errorCount++
      
      // Check if it's a quota/rate limit error - stop posting if so
      const errorMessage = e.data?.message || e.message || ''
      if (errorMessage.includes('quota') || errorMessage.includes('limit reached') || e.statusCode === 429) {
        showToast(`⚠️ Posted ${successCount} articles. ${errorMessage}`, 'info')
        return // Stop posting more
      }
    }
  }
  
  // Show final result
  if (errorCount === 0) {
    showToast(`✅ Posted ${successCount} articles to ${platforms.join(', ')}`, 'success')
  } else if (successCount > 0) {
    showToast(`⚠️ Posted ${successCount} articles, ${errorCount} failed`, 'info')
  } else {
    showToast(`❌ Failed to post all ${errorCount} articles`, 'error')
  }
}

// Preview article
function previewArticle(article: any) {
  previewingArticle.value = article
}

// Format date
function formatDate(date: string) {
  return new Date(date).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit'
  })
}

// Check if already connected on mount
onMounted(async () => {
  await loadArticles(true)  // Load all articles for instant search
  
  try {
    const status = await $fetch('/api/admin/social/status')
    ayrshareConnected.value = status.connected
    connectedPlatforms.value = status.platforms || []
  } catch (e) {
    // Not connected
  }
})
</script>
