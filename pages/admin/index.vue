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
              <p class="text-sm text-gray-500">Manage your positive news platform</p>
            </div>
          </div>
          <div class="flex items-center gap-4">
            <NuxtLink to="/" class="text-amber-600 hover:text-amber-700 font-medium flex items-center gap-2">
              <span>View Site</span>
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </NuxtLink>
            <button @click="logout" class="text-gray-500 hover:text-gray-700 p-2 rounded-lg hover:bg-gray-100">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </header>

    <div class="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      <!-- Navigation Tabs -->
      <nav class="flex gap-1 mb-8 bg-white rounded-xl p-1 shadow-sm">
        <NuxtLink 
          v-for="tab in tabs" 
          :key="tab.href"
          :to="tab.href"
          :class="[
            'flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors',
            route.path === tab.href 
              ? 'bg-amber-500 text-white' 
              : 'text-gray-600 hover:bg-gray-100'
          ]"
        >
          <component :is="tab.icon" class="w-5 h-5" />
          {{ tab.label }}
        </NuxtLink>
      </nav>

      <!-- Stats Cards -->
      <div class="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div v-for="stat in stats" :key="stat.label" class="bg-white rounded-xl p-6 shadow-sm">
          <div class="flex items-center gap-4">
            <div :class="['w-12 h-12 rounded-xl flex items-center justify-center', stat.bgColor]">
              <component :is="stat.icon" :class="['w-6 h-6', stat.iconColor]" />
            </div>
            <div>
              <p class="text-2xl font-bold text-gray-900">{{ stat.value }}</p>
              <p class="text-sm text-gray-500">{{ stat.label }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Quick Actions -->
      <div class="bg-white rounded-xl p-6 shadow-sm mb-8">
        <h2 class="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          <button 
            @click="triggerFetch" 
            :disabled="fetching"
            class="bg-amber-500 text-white px-4 py-2 rounded-lg font-medium hover:bg-amber-600 disabled:opacity-50 flex items-center gap-2"
          >
            <svg v-if="fetching" class="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <svg v-else class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            {{ fetching ? 'Fetching...' : 'Fetch News Now' }}
          </button>
          <button 
            @click="reclassifyArticles" 
            :disabled="reclassifying"
            class="bg-purple-500 text-white px-4 py-2 rounded-lg font-medium hover:bg-purple-600 disabled:opacity-50 flex items-center gap-2"
          >
            <svg v-if="reclassifying" class="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <svg v-else class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
            </svg>
            {{ reclassifying ? 'Reclassifying...' : 'Fix Categories' }}
          <button 
            @click="generateDaily" 
            :disabled="generatingDaily"
            class="bg-green-500 text-white px-4 py-2 rounded-lg font-medium hover:bg-green-600 disabled:opacity-50 flex items-center gap-2"
          >
            <svg v-if="generatingDaily" class="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <svg v-else class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {{ generatingDaily ? 'Generating...' : 'Generate Joke & Quote' }}
          </button>

          <NuxtLink to="/admin/articles" class="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg font-medium hover:bg-gray-200 flex items-center gap-2">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Manage Articles
          </NuxtLink>
          <NuxtLink to="/admin/settings" class="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg font-medium hover:bg-gray-200 flex items-center gap-2">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            Settings
          </NuxtLink>
          <NuxtLink to="/admin/social" class="bg-blue-500 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-600 flex items-center gap-2">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"/>
            </svg>
            Social Media
          </NuxtLink>
          <button 
            @click="deleteAllArticles" 
            :disabled="deleting"
            class="bg-red-500 text-white px-4 py-2 rounded-lg font-medium hover:bg-red-600 disabled:opacity-50 flex items-center gap-2"
          >
            <svg v-if="deleting" class="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <svg v-else class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
            {{ deleting ? 'Deleting...' : 'Delete All & Re-fetch' }}
          </button>
        </div>
        
        <!-- Reclassify result message -->
        <p v-if="reclassifyMessage" class="mt-3 text-sm" :class="reclassifyError ? 'text-red-600' : 'text-green-600'">
          {{ reclassifyMessage }}
        </p>
      </div>

      <!-- Category Distribution -->
      <div class="bg-white rounded-xl p-6 shadow-sm mb-8">
        <div class="flex items-center justify-between mb-4">
          <h2 class="text-lg font-semibold text-gray-900">Category Distribution</h2>
          <button @click="refreshCategoryStats" class="text-amber-600 hover:text-amber-700 text-sm font-medium">
            Refresh
          </button>
        </div>
        
        <div v-if="categoryStats" class="grid sm:grid-cols-5 gap-4">
          <div 
            v-for="cat in categoryStats.distribution" 
            :key="cat.category"
            class="bg-gray-50 rounded-lg p-4 text-center"
          >
            <span class="text-2xl block mb-1">{{ getCategoryEmoji(cat.category) }}</span>
            <p class="text-2xl font-bold text-gray-900">{{ cat.count }}</p>
            <p class="text-xs text-gray-500">{{ cat.category }}</p>
            <p class="text-xs text-amber-600">{{ cat.percentage }}</p>
          </div>
        </div>
        <div v-else class="text-center py-4 text-gray-500">
          Loading category stats...
        </div>
      </div>

      <!-- Recent Articles -->
      <div class="bg-white rounded-xl p-6 shadow-sm">
        <div class="flex items-center justify-between mb-4">
          <h2 class="text-lg font-semibold text-gray-900">Recent Articles</h2>
          <NuxtLink to="/admin/articles" class="text-amber-600 hover:text-amber-700 text-sm font-medium">
            View All 鈫?          </NuxtLink>
        </div>
        
        <div v-if="pending" class="text-center py-8">
          <div class="w-8 h-8 border-4 border-amber-200 border-t-amber-500 rounded-full animate-spin mx-auto"></div>
        </div>
        
        <div v-else-if="recentArticles?.length" class="divide-y divide-gray-100">
          <div v-for="article in recentArticles" :key="article._id" class="py-3 flex items-center justify-between">
            <div class="flex-1 min-w-0">
              <p class="font-medium text-gray-900 truncate">{{ article.title }}</p>
              <p class="text-sm text-gray-500">{{ article.originalSource }} 路 {{ formatDate(article.createdAt) }}</p>
            </div>
            <span :class="['px-2 py-1 rounded text-xs font-medium', getCategoryColor(article.category)]">
              {{ article.category }}
            </span>
          </div>
        </div>
        
        <div v-else class="text-center py-8 text-gray-500">
          No articles yet. Click "Fetch News Now" to get started!
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { h } from 'vue'
import { CORE_CATEGORIES, CATEGORY_MAP } from '~/utils/constants'

const route = useRoute()
const router = useRouter()
const fetching = ref(false)
const generatingDaily = ref(false)

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

// Icons as render functions
const DashboardIcon = { render: () => h('svg', { fill: 'none', stroke: 'currentColor', viewBox: '0 0 24 24' }, [h('path', { 'stroke-linecap': 'round', 'stroke-linejoin': 'round', 'stroke-width': '2', d: 'M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z' })]) }
const ArticlesIcon = { render: () => h('svg', { fill: 'none', stroke: 'currentColor', viewBox: '0 0 24 24' }, [h('path', { 'stroke-linecap': 'round', 'stroke-linejoin': 'round', 'stroke-width': '2', d: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z' })]) }
const AdsIcon = { render: () => h('svg', { fill: 'none', stroke: 'currentColor', viewBox: '0 0 24 24' }, [h('path', { 'stroke-linecap': 'round', 'stroke-linejoin': 'round', 'stroke-width': '2', d: 'M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z' })]) }
const SettingsIcon = { render: () => h('svg', { fill: 'none', stroke: 'currentColor', viewBox: '0 0 24 24' }, [h('path', { 'stroke-linecap': 'round', 'stroke-linejoin': 'round', 'stroke-width': '2', d: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z' }), h('path', { 'stroke-linecap': 'round', 'stroke-linejoin': 'round', 'stroke-width': '2', d: 'M15 12a3 3 0 11-6 0 3 3 0 016 0z' })]) }
const NewsIcon = { render: () => h('svg', { fill: 'none', stroke: 'currentColor', viewBox: '0 0 24 24' }, [h('path', { 'stroke-linecap': 'round', 'stroke-linejoin': 'round', 'stroke-width': '2', d: 'M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z' })]) }
const UsersIcon = { render: () => h('svg', { fill: 'none', stroke: 'currentColor', viewBox: '0 0 24 24' }, [h('path', { 'stroke-linecap': 'round', 'stroke-linejoin': 'round', 'stroke-width': '2', d: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z' })]) }
const ChartIcon = { render: () => h('svg', { fill: 'none', stroke: 'currentColor', viewBox: '0 0 24 24' }, [h('path', { 'stroke-linecap': 'round', 'stroke-linejoin': 'round', 'stroke-width': '2', d: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z' })]) }
const SourcesIcon = { render: () => h('svg', { fill: 'none', stroke: 'currentColor', viewBox: '0 0 24 24' }, [h('path', { 'stroke-linecap': 'round', 'stroke-linejoin': 'round', 'stroke-width': '2', d: 'M6 5c7.18 0 13 5.82 13 13M6 11a7 7 0 017 7m-6 0a1 1 0 11-2 0 1 1 0 012 0z' })]) }
const SocialIcon = { render: () => h('svg', { fill: 'none', stroke: 'currentColor', viewBox: '0 0 24 24' }, [h('path', { 'stroke-linecap': 'round', 'stroke-linejoin': 'round', 'stroke-width': '2', d: 'M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z' })]) }
const VideoIcon = { render: () => h('svg', { fill: 'none', stroke: 'currentColor', viewBox: '0 0 24 24' }, [h('path', { 'stroke-linecap': 'round', 'stroke-linejoin': 'round', 'stroke-width': '2', d: 'M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z' })]) }
const SubscribersIcon = { render: () => h('svg', { fill: 'none', stroke: 'currentColor', viewBox: '0 0 24 24' }, [h('path', { 'stroke-linecap': 'round', 'stroke-linejoin': 'round', 'stroke-width': '2', d: 'M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z' })]) }

const FeedIcon = { render: () => h('svg', { fill: 'none', stroke: 'currentColor', viewBox: '0 0 24 24' }, [h('path', { 'stroke-linecap': 'round', 'stroke-linejoin': 'round', 'stroke-width': '2', d: 'M6 5c7.18 0 13 5.82 13 13M6 11a7 7 0 017 7m-6 0a1 1 0 11-2 0 1 1 0 012 0z' })]) }

const tabs = [
  { label: 'Dashboard', href: '/admin', icon: DashboardIcon },
  { label: 'Articles', href: '/admin/articles', icon: ArticlesIcon },
  { label: 'Feeds', href: '/admin/feeds', icon: FeedIcon },
  { label: 'Social', href: '/admin/social', icon: SocialIcon },
  { label: 'Video', href: '/admin/video', icon: VideoIcon },
  { label: 'Subscribers', href: '/admin/subscribers', icon: SubscribersIcon },
  { label: 'Ads', href: '/admin/ads', icon: AdsIcon },
  { label: 'Settings', href: '/admin/settings', icon: SettingsIcon },
]

// Fetch stats
const { data: statsData } = await useFetch('/api/admin/stats')

const stats = computed(() => [
  { 
    label: 'Total Articles', 
    value: statsData.value?.totalArticles || 0, 
    icon: NewsIcon, 
    bgColor: 'bg-amber-100', 
    iconColor: 'text-amber-600' 
  },
  { 
    label: 'This Week', 
    value: statsData.value?.thisWeek || 0, 
    icon: ChartIcon, 
    bgColor: 'bg-green-100', 
    iconColor: 'text-green-600' 
  },
  { 
    label: 'Sources Active', 
    value: `${statsData.value?.activeSources || 0}/${statsData.value?.totalSources || 54}`, 
    icon: SourcesIcon, 
    bgColor: 'bg-blue-100', 
    iconColor: 'text-blue-600' 
  },
  { 
    label: 'Categories', 
    value: CORE_CATEGORIES.length, 
    icon: DashboardIcon, 
    bgColor: 'bg-purple-100', 
    iconColor: 'text-purple-600' 
  },
])

// Fetch recent articles
const { data: articlesData, pending } = await useFetch('/api/stories', {
  query: { limit: 5 }
})

const recentArticles = computed(() => articlesData.value?.stories || [])

function formatDate(date: string) {
  return new Date(date).toLocaleDateString('en-US', { 
    month: 'short', 
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit'
  })
}

function getCategoryColor(category: string) {
  const cat = CATEGORY_MAP[category]
  if (!cat) return 'bg-gray-100 text-gray-700'
  return `bg-${cat.twColor}-100 text-${cat.twColor}-700`
}

function getCategoryEmoji(category: string) {
    return CATEGORY_MAP[category]?.emoji || '✅'
}

async function triggerFetch() {
  fetching.value = true
  try {
    await $fetch('/api/admin/trigger-fetch', { method: 'POST' })
    alert('Fetch triggered! Check Inngest dashboard for progress.')
  } catch (e) {
    alert('Failed to trigger fetch. Check console for errors.')
    console.error(e)
  } finally {
    fetching.value = false
  }
}

// Reclassify articles
const reclassifying = ref(false)
const reclassifyMessage = ref('')
const reclassifyError = ref(false)
const reclassifyStats = ref({ processed: 0, total: 0 })

async function reclassifyArticles() {
  reclassifying.value = true
  reclassifyMessage.value = 'Analyzing articles...'
  reclassifyError.value = false
  reclassifyStats.value = { processed: 0, total: 0 }
  
  try {
    // 1. First dry run to get total count
    const dryRun = await $fetch('/api/admin/reclassify', { 
      method: 'POST',
      body: { batchSize: 50, dryRun: true }
    })
    
    if (dryRun.total === 0) {
      reclassifyMessage.value = 'All articles are already properly categorized! 馃帀'
      await refreshCategoryStats()
      reclassifying.value = false
      return
    }

    // 2. Ask for confirmation
    const confirmMsg = `Found ${dryRun.total} articles to check.\n(Approximately ${dryRun.changed} need changes)`
    if (!confirm(`${confirmMsg}\n\nStart AUTO-FIX process? This will run in batches.`)) {
      reclassifyMessage.value = 'Cancelled.'
      reclassifying.value = false
      return
    }

    reclassifyMessage.value = `Starting... Found ${dryRun.total} to process`
    
    // 3. Loop until done (Process All)
    let processedCount = 0
    let changedCount = 0
    let batchNum = 1
    
    while (true) {
      reclassifyMessage.value = `Batch ${batchNum}: Processing next 50 articles... (${processedCount} done so far)`
      
      const result = await $fetch('/api/admin/reclassify', { 
        method: 'POST',
        body: { batchSize: 50, dryRun: false }
      })
      
      processedCount += result.total
      changedCount += result.changed
      batchNum++
      
      // Update UI stats
      reclassifyStats.value = { processed: processedCount, total: dryRun.total } // Estimate
      
      // If we processed fewer than requested, or found 0 candidates, we are done
      if (result.total === 0 || result.changed === 0) {
        break
      }
      
      // Small delay to be nice to API
      await new Promise(r => setTimeout(r, 1000))
    }
    
    reclassifyMessage.value = `鉁?Setup Complete! Processed ${processedCount} articles. Fixed ${changedCount} categories.`
    await refreshCategoryStats()

  } catch (e) {
    reclassifyError.value = true
    reclassifyMessage.value = 'Stopped: ' + (e.message || 'Unknown error')
    console.error(e)
  } finally {
    reclassifying.value = false
  }
}

// Delete all articles
const deleting = ref(false)

async function deleteAllArticles() {
  // Double confirmation
  if (!confirm('鈿狅笍 This will DELETE ALL ARTICLES!\n\nAre you sure you want to start fresh?')) {
    return
  }
  
  const confirmPhrase = prompt('Type "DELETE ALL ARTICLES" to confirm:')
  if (confirmPhrase !== 'DELETE ALL ARTICLES') {
    alert('Deletion cancelled - phrase did not match.')
    return
  }
  
  deleting.value = true
  
  try {
    const result = await $fetch('/api/admin/delete-all', { 
      method: 'POST',
      body: { confirm: 'DELETE ALL ARTICLES' }
    })
    
    alert(`鉁?${result.message}\n\nClick "Fetch News Now" to get fresh articles with proper categories.`)
    
    // Refresh stats
    await refreshCategoryStats()
    
    // Trigger fetch automatically
    if (confirm('Fetch new articles now?')) {
      await triggerFetch()
    }
  } catch (e: any) {
    alert('Failed to delete: ' + (e.data?.message || e.message))
    console.error(e)
  } finally {
    deleting.value = false
  }
}

// Category stats
const categoryStats = ref<any>(null)

async function refreshCategoryStats() {
  try {
    categoryStats.value = await $fetch('/api/admin/category-stats')
  } catch (e) {
    console.error('Failed to load category stats:', e)
  }
}

// Load category stats on mount
onMounted(() => {
  refreshCategoryStats()
})

// SEO
useHead({
  title: 'Admin Dashboard - BrightWire',
})
</script>



