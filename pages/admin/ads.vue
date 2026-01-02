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
              <p class="text-sm text-gray-500">Advertisements</p>
            </div>
          </div>
          <div class="flex items-center gap-3">
            <NuxtLink to="/" class="text-amber-600 hover:text-amber-700 font-medium">View Site →</NuxtLink>
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
      <nav class="flex gap-1 mb-8 bg-white rounded-xl p-1 shadow-sm overflow-x-auto">
        <NuxtLink to="/admin" class="flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-gray-600 hover:bg-gray-100 whitespace-nowrap">
          Dashboard
        </NuxtLink>
        <NuxtLink to="/admin/articles" class="flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-gray-600 hover:bg-gray-100 whitespace-nowrap">
          Articles
        </NuxtLink>
        <NuxtLink to="/admin/ads" class="flex items-center gap-2 px-4 py-2 rounded-lg font-medium bg-amber-500 text-white whitespace-nowrap">
          Advertisements
        </NuxtLink>
        <NuxtLink to="/admin/settings" class="flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-gray-600 hover:bg-gray-100 whitespace-nowrap">
          Settings
        </NuxtLink>
      </nav>

      <!-- Stats Cards -->
      <div class="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div class="bg-white rounded-xl p-5 shadow-sm">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <span class="text-xl">📢</span>
            </div>
            <div>
              <p class="text-2xl font-bold text-gray-900">{{ stats.total }}</p>
              <p class="text-sm text-gray-500">Total Ads</p>
            </div>
          </div>
        </div>
        
        <div class="bg-white rounded-xl p-5 shadow-sm">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <span class="text-xl">✅</span>
            </div>
            <div>
              <p class="text-2xl font-bold text-gray-900">{{ stats.active }}</p>
              <p class="text-sm text-gray-500">Active Campaigns</p>
            </div>
          </div>
        </div>
        
        <div class="bg-white rounded-xl p-5 shadow-sm">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
              <span class="text-xl">👁️</span>
            </div>
            <div>
              <p class="text-2xl font-bold text-gray-900">{{ formatNumber(stats.totalImpressions) }}</p>
              <p class="text-sm text-gray-500">Total Impressions</p>
            </div>
          </div>
        </div>
        
        <div class="bg-white rounded-xl p-5 shadow-sm">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
              <span class="text-xl">💰</span>
            </div>
            <div>
              <p class="text-2xl font-bold text-gray-900">${{ formatNumber(stats.totalRevenue) }}</p>
              <p class="text-sm text-gray-500">Total Revenue</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Actions Bar -->
      <div class="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center mb-6">
        <div class="flex flex-wrap gap-2">
          <select v-model="filterStatus" class="px-4 py-2 border border-gray-300 rounded-lg bg-white text-sm">
            <option value="">All Status</option>
            <option value="active">Active</option>
            <option value="paused">Paused</option>
            <option value="draft">Draft</option>
            <option value="pending">Pending</option>
            <option value="expired">Expired</option>
          </select>
          <select v-model="filterType" class="px-4 py-2 border border-gray-300 rounded-lg bg-white text-sm">
            <option value="">All Types</option>
            <option value="newsletter">Newsletter</option>
            <option value="sponsored">Sponsored Article</option>
            <option value="display">Display</option>
            <option value="category">Category Sponsor</option>
          </select>
          <button 
            @click="expireAds"
            :disabled="expiring"
            class="px-4 py-2 border border-gray-300 rounded-lg bg-white text-sm text-gray-600 hover:bg-gray-50 disabled:opacity-50"
            title="Expire past-due ads and pause over-budget campaigns"
          >
            {{ expiring ? 'Processing...' : '🔄 Cleanup' }}
          </button>
        </div>
        <button 
          @click="showCreateModal = true"
          class="bg-amber-500 text-white px-4 py-2 rounded-lg font-medium hover:bg-amber-600 transition-colors flex items-center gap-2"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
          </svg>
          Create Ad
        </button>
      </div>

      <!-- Ads Table -->
      <div class="bg-white rounded-xl shadow-sm overflow-hidden">
        <div class="overflow-x-auto">
          <table class="w-full">
            <thead class="bg-gray-50 border-b border-gray-200">
              <tr>
                <th class="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Advertiser</th>
                <th class="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Type</th>
                <th class="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Priority</th>
                <th class="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Status</th>
                <th class="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Dates</th>
                <th class="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Performance</th>
                <th class="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Revenue</th>
                <th class="text-right px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-100">
              <tr v-for="ad in filteredAds" :key="ad._id" class="hover:bg-gray-50">
                <td class="px-6 py-4">
                  <div>
                    <p class="font-medium text-gray-900">{{ ad.advertiser }}</p>
                    <p class="text-sm text-gray-500">{{ ad.name }}</p>
                  </div>
                </td>
                <td class="px-6 py-4">
                  <span 
                    class="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium"
                    :class="typeClass(ad.type)"
                  >
                    {{ typeEmoji(ad.type) }} {{ typeLabel(ad.type) }}
                  </span>
                </td>
                <td class="px-6 py-4">
                  <span 
                    class="inline-flex items-center justify-center w-8 h-8 rounded-full text-sm font-bold"
                    :class="priorityClass(ad.priority || 5)"
                  >
                    {{ ad.priority || 5 }}
                  </span>
                </td>
                <td class="px-6 py-4">
                  <span 
                    class="inline-flex px-2 py-1 rounded-full text-xs font-medium"
                    :class="statusClass(ad.status)"
                  >
                    {{ ad.status }}
                  </span>
                </td>
                <td class="px-6 py-4 text-sm text-gray-500">
                  <p>{{ formatDate(ad.startDate) }}</p>
                  <p>to {{ formatDate(ad.endDate) }}</p>
                </td>
                <td class="px-6 py-4">
                  <div class="text-sm">
                    <p><span class="text-gray-500">Impr:</span> {{ formatNumber(ad.impressions || 0) }}</p>
                    <p><span class="text-gray-500">Clicks:</span> {{ formatNumber(ad.clicks || 0) }}</p>
                    <p class="text-xs text-gray-400">CTR: {{ calculateCTR(ad) }}%</p>
                  </div>
                </td>
                <td class="px-6 py-4">
                  <p class="font-medium text-gray-900">${{ (ad.spent || 0).toFixed(2) }}</p>
                  <p class="text-xs text-gray-500">{{ priceLabel(ad) }}</p>
                  <!-- Budget progress bar -->
                  <div v-if="ad.budget" class="mt-1">
                    <div class="w-20 bg-gray-200 rounded-full h-1.5">
                      <div 
                        class="h-1.5 rounded-full transition-all"
                        :class="budgetProgress(ad) >= 90 ? 'bg-red-500' : budgetProgress(ad) >= 70 ? 'bg-amber-500' : 'bg-green-500'"
                        :style="{ width: `${Math.min(100, budgetProgress(ad))}%` }"
                      ></div>
                    </div>
                    <p class="text-[10px] text-gray-400 mt-0.5">{{ budgetProgress(ad).toFixed(0) }}% of ${{ ad.budget }}</p>
                  </div>
                </td>
                <td class="px-6 py-4 text-right">
                  <div class="flex justify-end gap-2">
                    <button 
                      @click="editAd(ad)"
                      class="p-2 text-gray-500 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
                    >
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </button>
                    <button 
                      v-if="ad.status === 'active'"
                      @click="pauseAd(ad._id)"
                      class="p-2 text-gray-500 hover:text-orange-600 hover:bg-orange-50 rounded-lg transition-colors"
                      title="Pause"
                    >
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </button>
                    <button 
                      v-if="ad.status === 'paused' || ad.status === 'draft'"
                      @click="activateAd(ad._id)"
                      class="p-2 text-gray-500 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                      title="Activate"
                    >
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </button>
                    <button 
                      @click="deleteAd(ad._id)"
                      class="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </td>
              </tr>
              <tr v-if="filteredAds.length === 0">
                <td colspan="7" class="px-6 py-12 text-center text-gray-500">
                  <span class="text-4xl block mb-2">📭</span>
                  No advertisements found
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- Create/Edit Modal -->
    <Teleport to="body">
      <div v-if="showCreateModal || editingAd" class="fixed inset-0 z-50 overflow-y-auto">
        <div class="fixed inset-0 bg-black/50" @click="closeModal"></div>
        <div class="relative min-h-screen flex items-center justify-center p-4">
          <div class="relative bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div class="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
              <h2 class="text-xl font-bold text-gray-900">
                {{ editingAd ? 'Edit Advertisement' : 'Create Advertisement' }}
              </h2>
              <button @click="closeModal" class="p-2 hover:bg-gray-100 rounded-lg">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <form @submit.prevent="saveAd" class="p-6 space-y-6">
              <!-- Basic Info -->
              <div class="grid sm:grid-cols-2 gap-4">
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Ad Name (Internal)</label>
                  <input v-model="form.name" type="text" required 
                    class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500"
                    placeholder="Q1 Newsletter Campaign"
                  />
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Advertiser</label>
                  <input v-model="form.advertiser" type="text" required 
                    class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500"
                    placeholder="Acme Corp"
                  />
                </div>
              </div>

              <!-- Type & Placement -->
              <div class="grid sm:grid-cols-2 gap-4">
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Ad Type</label>
                  <select v-model="form.type" required class="w-full px-4 py-2 border border-gray-300 rounded-lg">
                    <option value="newsletter">📧 Newsletter Sponsorship ($500/week)</option>
                    <option value="sponsored">📝 Sponsored Article ($1,000)</option>
                    <option value="display">🖼️ Display Advertising ($10 CPM)</option>
                    <option value="category">🏷️ Category Sponsorship (Custom)</option>
                  </select>
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Placement</label>
                  <select v-model="form.placement" required class="w-full px-4 py-2 border border-gray-300 rounded-lg">
                    <option value="header">Header Banner</option>
                    <option value="sidebar">Sidebar</option>
                    <option value="in-feed">In-Feed (Between Articles)</option>
                    <option value="article-top">Article Top</option>
                    <option value="article-bottom">Article Bottom</option>
                    <option value="newsletter">Newsletter</option>
                    <option value="category-header">Category Header</option>
                  </select>
                </div>
              </div>

              <!-- Content -->
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Headline</label>
                <input v-model="form.headline" type="text" 
                  class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500"
                  placeholder="Discover our eco-friendly products"
                />
              </div>
              
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea v-model="form.description" rows="2"
                  class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500"
                  placeholder="Short description of your ad..."
                ></textarea>
              </div>

              <div class="grid sm:grid-cols-2 gap-4">
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Image URL</label>
                  <input v-model="form.imageUrl" type="url" 
                    class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500"
                    placeholder="https://..."
                  />
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Link URL</label>
                  <input v-model="form.linkUrl" type="url" required
                    class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500"
                    placeholder="https://advertiser.com/landing"
                  />
                </div>
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">CTA Button Text</label>
                <input v-model="form.ctaText" type="text" 
                  class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500"
                  placeholder="Learn More"
                />
              </div>

              <!-- Category Sponsor Specific -->
              <div v-if="form.type === 'category'" class="bg-amber-50 rounded-lg p-4 space-y-4">
                <h4 class="font-medium text-amber-900">Category Sponsorship Options</h4>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Sponsored Category</label>
                  <select v-model="form.sponsoredCategory" class="w-full px-4 py-2 border border-gray-300 rounded-lg">
                    <option v-for="cat in CORE_CATEGORIES" :key="cat.id" :value="cat.id">
                      {{ cat.emoji }} {{ cat.label }}
                    </option>
                  </select>
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Sponsor Text</label>
                  <input v-model="form.sponsorText" type="text" 
                    class="w-full px-4 py-2 border border-gray-300 rounded-lg"
                    placeholder="Brought to you by Acme Corp"
                  />
                </div>
              </div>

              <!-- Sponsored Article Specific -->
              <div v-if="form.type === 'sponsored'" class="bg-blue-50 rounded-lg p-4 space-y-4">
                <h4 class="font-medium text-blue-900 flex items-center gap-2">
                  <span>📝</span> Sponsored Article
                </h4>
                <p class="text-sm text-blue-700">
                  Sponsored articles are native content pieces that tell your brand's story. 
                </p>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Select Article</label>
                  
                  <!-- Search input -->
                  <div class="relative mb-2">
                    <svg class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
                    </svg>
                    <input 
                      v-model="articleSearch"
                      type="text"
                      placeholder="Search articles..."
                      class="w-full pl-10 pr-4 py-2 border border-blue-300 rounded-lg bg-white text-sm"
                      @focus="loadArticles"
                    />
                  </div>
                  
                  <!-- Articles list -->
                  <div class="max-h-48 overflow-y-auto border border-blue-200 rounded-lg bg-white">
                    <div v-if="articlesLoading" class="p-4 text-center text-gray-500 text-sm">
                      Loading articles...
                    </div>
                    <div v-else-if="filteredArticles.length === 0" class="p-4 text-center text-gray-500 text-sm">
                      No articles found
                    </div>
                    <div
                      v-for="article in filteredArticles"
                      :key="article._id"
                      @click="form.articleSlug = article.slug"
                      class="px-4 py-3 cursor-pointer border-b border-gray-100 last:border-0 hover:bg-blue-50 transition-colors"
                      :class="{ 'bg-blue-100': form.articleSlug === article.slug }"
                    >
                      <div class="flex items-start gap-3">
                        <div 
                          class="w-5 h-5 mt-0.5 rounded border-2 flex-shrink-0 flex items-center justify-center"
                          :class="form.articleSlug === article.slug ? 'bg-blue-500 border-blue-500' : 'border-gray-300'"
                        >
                          <svg v-if="form.articleSlug === article.slug" class="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7"/>
                          </svg>
                        </div>
                        <div class="flex-1 min-w-0">
                          <p class="text-sm font-medium text-gray-900 line-clamp-1">{{ article.title }}</p>
                          <p class="text-xs text-gray-500 mt-0.5">{{ article.slug }}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <!-- Selected article display -->
                  <div v-if="form.articleSlug" class="mt-2 flex items-center gap-2 text-sm">
                    <span class="text-green-600">✓</span>
                    <span class="text-gray-700">Selected:</span>
                    <code class="bg-gray-100 px-2 py-0.5 rounded text-blue-600">{{ form.articleSlug }}</code>
                    <button @click="form.articleSlug = ''" type="button" class="text-gray-400 hover:text-red-500">
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
                      </svg>
                    </button>
                  </div>
                </div>
                
                <div class="flex items-center gap-2 pt-2 border-t border-blue-200">
                  <span class="text-sm text-blue-700">Or create a new one:</span>
                  <NuxtLink 
                    to="/admin/editor/new?sponsored=true"
                    class="inline-flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg text-sm font-medium hover:bg-blue-600"
                    target="_blank"
                  >
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
                    </svg>
                    Create Sponsored Article
                  </NuxtLink>
                </div>
              </div>

              <!-- Schedule -->
              <div class="grid sm:grid-cols-2 gap-4">
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                  <input v-model="form.startDate" type="date" required
                    class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500"
                  />
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                  <input v-model="form.endDate" type="date" required
                    class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500"
                  />
                </div>
              </div>

              <!-- Pricing & Priority -->
              <div class="grid sm:grid-cols-4 gap-4">
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Price Type</label>
                  <select v-model="form.priceType" class="w-full px-4 py-2 border border-gray-300 rounded-lg">
                    <option value="fixed">Fixed Price</option>
                    <option value="cpm">CPM (per 1000 impressions)</option>
                    <option value="cpc">CPC (per click)</option>
                  </select>
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Price Amount ($)</label>
                  <input v-model="form.priceAmount" type="number" step="0.01" min="0"
                    class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500"
                    placeholder="500"
                  />
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Budget Cap ($)</label>
                  <input v-model="form.budget" type="number" step="0.01" min="0"
                    class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500"
                    placeholder="Optional"
                  />
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Priority (1-10)</label>
                  <input v-model="form.priority" type="number" min="1" max="10"
                    class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500"
                    placeholder="5"
                  />
                  <p class="text-xs text-gray-500 mt-1">Higher = shows more often</p>
                </div>
              </div>

              <!-- Contact -->
              <div class="grid sm:grid-cols-2 gap-4">
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Contact Name</label>
                  <input v-model="form.contactName" type="text" required
                    class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500"
                    placeholder="John Smith"
                  />
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Contact Email</label>
                  <input v-model="form.contactEmail" type="email" required
                    class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500"
                    placeholder="john@company.com"
                  />
                </div>
              </div>

              <!-- Status -->
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select v-model="form.status" class="w-full px-4 py-2 border border-gray-300 rounded-lg">
                  <option value="draft">Draft</option>
                  <option value="pending">Pending Review</option>
                  <option value="active">Active</option>
                  <option value="paused">Paused</option>
                </select>
              </div>

              <!-- Notes -->
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Internal Notes</label>
                <textarea v-model="form.notes" rows="2"
                  class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500"
                  placeholder="Any internal notes about this campaign..."
                ></textarea>
              </div>

              <!-- Submit -->
              <div class="flex justify-end gap-3 pt-4 border-t">
                <button type="button" @click="closeModal" class="px-6 py-2 text-gray-600 hover:bg-gray-100 rounded-lg">
                  Cancel
                </button>
                <button type="submit" :disabled="saving" class="px-6 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 disabled:opacity-50">
                  {{ saving ? 'Saving...' : (editingAd ? 'Update Ad' : 'Create Ad') }}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import type { Advertisement, AdType, AdStatus } from '~/types'
import { CORE_CATEGORIES } from '~/utils/constants'

const router = useRouter()

// Auth check
const { data: authCheck } = await useFetch('/api/admin/check')
if (!authCheck.value?.authenticated) {
  await navigateTo('/admin/login')
}

// State
const showCreateModal = ref(false)
const editingAd = ref<Advertisement | null>(null)
const saving = ref(false)
const expiring = ref(false)
const filterStatus = ref('')
const filterType = ref('')

// Articles for sponsored article selection
const articles = ref<any[]>([])
const articlesLoading = ref(false)
const articleSearch = ref('')

// Load articles for dropdown
async function loadArticles() {
  if (articles.value.length > 0) return // Already loaded
  articlesLoading.value = true
  try {
    const data = await $fetch('/api/stories', { query: { limit: 100 } })
    articles.value = data.stories || []
  } catch (e) {
    console.error('Failed to load articles:', e)
  } finally {
    articlesLoading.value = false
  }
}

// Filtered articles for search
const filteredArticles = computed(() => {
  if (!articleSearch.value) return articles.value.slice(0, 20)
  const search = articleSearch.value.toLowerCase()
  return articles.value
    .filter(a => a.title.toLowerCase().includes(search) || a.slug.toLowerCase().includes(search))
    .slice(0, 20)
})

// Form
const defaultForm = {
  name: '',
  advertiser: '',
  type: 'display' as AdType,
  placement: 'sidebar' as string,
  status: 'draft' as AdStatus,
  headline: '',
  description: '',
  imageUrl: '',
  linkUrl: '',
  ctaText: 'Learn More',
  articleSlug: '',
  sponsoredCategory: '',
  sponsorText: '',
  startDate: new Date().toISOString().split('T')[0],
  endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
  priceType: 'fixed' as string,
  priceAmount: 0,
  budget: null as number | null,
  priority: 5,
  contactName: '',
  contactEmail: '',
  notes: '',
}

const form = ref({ ...defaultForm })

// Fetch ads
const { data, refresh } = await useFetch('/api/admin/ads')
const ads = computed(() => data.value?.ads || [])
const stats = computed(() => data.value?.stats || { total: 0, active: 0, totalImpressions: 0, totalRevenue: 0 })

// Filtered ads
const filteredAds = computed(() => {
  let result = ads.value
  if (filterStatus.value) {
    result = result.filter(a => a.status === filterStatus.value)
  }
  if (filterType.value) {
    result = result.filter(a => a.type === filterType.value)
  }
  return result
})

// Helpers
function formatNumber(n: number): string {
  if (n >= 1000000) return (n / 1000000).toFixed(1) + 'M'
  if (n >= 1000) return (n / 1000).toFixed(1) + 'K'
  return n.toString()
}

function formatDate(date: string | Date): string {
  return new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

function calculateCTR(ad: Advertisement): string {
  if (!ad.impressions) return '0.00'
  return ((ad.clicks || 0) / ad.impressions * 100).toFixed(2)
}

function budgetProgress(ad: Advertisement): number {
  if (!ad.budget || ad.budget <= 0) return 0
  return ((ad.spent || 0) / ad.budget) * 100
}

function priceLabel(ad: Advertisement): string {
  if (ad.priceType === 'cpm') return `$${ad.priceAmount} CPM`
  if (ad.priceType === 'cpc') return `$${ad.priceAmount} CPC`
  return `$${ad.priceAmount} fixed`
}

function typeEmoji(type: AdType): string {
  const emojis: Record<AdType, string> = {
    newsletter: '📧',
    sponsored: '📝',
    display: '🖼️',
    category: '🏷️',
  }
  return emojis[type] || '📢'
}

function typeLabel(type: AdType): string {
  const labels: Record<AdType, string> = {
    newsletter: 'Newsletter',
    sponsored: 'Sponsored',
    display: 'Display',
    category: 'Category',
  }
  return labels[type] || type
}

function typeClass(type: AdType): string {
  const classes: Record<AdType, string> = {
    newsletter: 'bg-purple-100 text-purple-700',
    sponsored: 'bg-blue-100 text-blue-700',
    display: 'bg-green-100 text-green-700',
    category: 'bg-amber-100 text-amber-700',
  }
  return classes[type] || 'bg-gray-100 text-gray-700'
}

function statusClass(status: AdStatus): string {
  const classes: Record<AdStatus, string> = {
    draft: 'bg-gray-100 text-gray-700',
    pending: 'bg-yellow-100 text-yellow-700',
    active: 'bg-green-100 text-green-700',
    paused: 'bg-orange-100 text-orange-700',
    expired: 'bg-red-100 text-red-700',
    rejected: 'bg-red-100 text-red-700',
  }
  return classes[status] || 'bg-gray-100 text-gray-700'
}

function priorityClass(priority: number): string {
  if (priority >= 8) return 'bg-green-500 text-white'      // High priority
  if (priority >= 6) return 'bg-green-100 text-green-700'
  if (priority >= 4) return 'bg-gray-100 text-gray-700'    // Normal
  if (priority >= 2) return 'bg-orange-100 text-orange-700'
  return 'bg-red-100 text-red-700'                         // Low priority
}

// Actions
function editAd(ad: Advertisement) {
  editingAd.value = ad
  form.value = {
    name: ad.name,
    advertiser: ad.advertiser,
    type: ad.type,
    placement: ad.placement,
    status: ad.status,
    headline: ad.headline || '',
    description: ad.description || '',
    imageUrl: ad.imageUrl || '',
    linkUrl: ad.linkUrl,
    ctaText: ad.ctaText || 'Learn More',
    articleSlug: ad.articleSlug || '',
    sponsoredCategory: ad.sponsoredCategory || '',
    sponsorText: ad.sponsorText || '',
    startDate: new Date(ad.startDate).toISOString().split('T')[0],
    endDate: new Date(ad.endDate).toISOString().split('T')[0],
    priceType: ad.priceType,
    priceAmount: ad.priceAmount,
    budget: ad.budget || null,
    priority: ad.priority || 5,
    contactName: ad.contactName,
    contactEmail: ad.contactEmail,
    notes: ad.notes || '',
  }
  // Load articles if editing a sponsored ad
  if (ad.type === 'sponsored') {
    loadArticles()
  }
}

function closeModal() {
  showCreateModal.value = false
  editingAd.value = null
  form.value = { ...defaultForm }
  articleSearch.value = ''
}

// Watch for type change to load articles
watch(() => form.value.type, (newType) => {
  if (newType === 'sponsored') {
    loadArticles()
  }
})

async function saveAd() {
  saving.value = true
  
  try {
    if (editingAd.value) {
      await $fetch(`/api/admin/ads/${editingAd.value._id}`, {
        method: 'PUT',
        body: form.value,
      })
    } else {
      await $fetch('/api/admin/ads', {
        method: 'POST',
        body: form.value,
      })
    }
    
    closeModal()
    refresh()
  } catch (e) {
    console.error('Failed to save ad:', e)
    alert('Failed to save advertisement')
  } finally {
    saving.value = false
  }
}

async function deleteAd(id: string) {
  if (!confirm('Are you sure you want to delete this advertisement?')) return
  
  try {
    await $fetch(`/api/admin/ads/${id}`, { method: 'DELETE' })
    refresh()
  } catch (e) {
    console.error('Failed to delete ad:', e)
    alert('Failed to delete advertisement')
  }
}

async function pauseAd(id: string) {
  try {
    await $fetch(`/api/admin/ads/${id}`, {
      method: 'PUT',
      body: { status: 'paused' },
    })
    refresh()
  } catch (e) {
    console.error('Failed to pause ad:', e)
  }
}

async function activateAd(id: string) {
  try {
    await $fetch(`/api/admin/ads/${id}`, {
      method: 'PUT',
      body: { status: 'active' },
    })
    refresh()
  } catch (e) {
    console.error('Failed to activate ad:', e)
  }
}

async function expireAds() {
  expiring.value = true
  try {
    const result = await $fetch('/api/admin/ads/expire', { method: 'POST' })
    refresh()
    if (result.expiredByDate > 0 || result.pausedByBudget > 0) {
      alert(result.message)
    } else {
      alert('No ads needed to be expired or paused')
    }
  } catch (e) {
    console.error('Failed to expire ads:', e)
    alert('Failed to process expired ads')
  } finally {
    expiring.value = false
  }
}

async function logout() {
  await $fetch('/api/admin/logout', { method: 'POST' })
  router.push('/admin/login')
}
</script>
