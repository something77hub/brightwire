<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Header -->
    <header class="bg-white border-b border-gray-200 sticky top-0 z-20">
      <div class="max-w-5xl mx-auto px-4 sm:px-6 py-3">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-3">
            <NuxtLink to="/admin/articles" class="p-2 hover:bg-gray-100 rounded-lg text-gray-500">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
            </NuxtLink>
            <div>
              <h1 class="font-bold text-gray-900">{{ isNew ? 'New Article' : 'Edit Article' }}</h1>
              <p class="text-xs text-gray-500">{{ isSponsored ? '📢 Sponsored Content' : '📰 Editorial' }}</p>
            </div>
          </div>
          
          <div class="flex items-center gap-2">
            <span v-if="autoSaved" class="text-xs text-green-600 flex items-center gap-1">
              <svg class="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
              </svg>
              Saved
            </span>
            <button 
              @click="saveDraft"
              :disabled="saving"
              class="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg font-medium text-sm"
            >
              Save Draft
            </button>
            <button 
              @click="publish"
              :disabled="saving || !canPublish"
              class="px-4 py-2 bg-amber-500 text-white rounded-lg font-medium text-sm hover:bg-amber-600 disabled:opacity-50"
            >
              {{ saving ? 'Saving...' : 'Publish' }}
            </button>
          </div>
        </div>
      </div>
    </header>

    <main class="max-w-5xl mx-auto px-4 sm:px-6 py-8">
      <div class="grid lg:grid-cols-3 gap-8">
        <!-- Main Editor -->
        <div class="lg:col-span-2 space-y-6">
          <!-- Title -->
          <div>
            <input
              v-model="article.title"
              type="text"
              placeholder="Article title..."
              class="w-full text-3xl font-bold text-amber-950 bg-transparent border-0 focus:ring-0 focus:outline-none placeholder-gray-300"
            />
          </div>

          <!-- Summary -->
          <div>
            <textarea
              v-model="article.summary"
              placeholder="Write a brief summary (2-3 sentences)..."
              rows="2"
              class="w-full text-lg text-amber-700/80 bg-transparent border-0 focus:ring-0 focus:outline-none placeholder-gray-300 resize-none"
            ></textarea>
          </div>

          <!-- Content Editor -->
          <div class="bg-white rounded-xl shadow-sm overflow-hidden">
            <ClientOnly>
              <TiptapEditor 
                v-model="article.content" 
                placeholder="Tell your story..."
              />
              <template #fallback>
                <div class="p-6 text-center text-gray-400">
                  Loading editor...
                </div>
              </template>
            </ClientOnly>
          </div>
        </div>

        <!-- Sidebar -->
        <div class="space-y-6">
          <!-- Hero Image -->
          <div class="bg-white rounded-xl p-5 shadow-sm">
            <h3 class="font-semibold text-gray-900 mb-3">Hero Image</h3>
            <div 
              v-if="article.imageUrl"
              class="relative rounded-lg overflow-hidden mb-3"
            >
              <img :src="article.imageUrl" alt="Hero" class="w-full h-40 object-cover" />
              <button 
                @click="article.imageUrl = ''"
                class="absolute top-2 right-2 p-1 bg-black/50 rounded-full text-white hover:bg-black/70"
              >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <input
              v-model="article.imageUrl"
              type="url"
              placeholder="Image URL..."
              class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-amber-500 focus:border-amber-500"
            />
          </div>

          <!-- Category -->
          <div class="bg-white rounded-xl p-5 shadow-sm">
            <h3 class="font-semibold text-gray-900 mb-3">Category</h3>
            <select 
              v-model="article.category"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-amber-500 focus:border-amber-500"
            >
              <option v-for="cat in CORE_CATEGORIES" :key="cat.id" :value="cat.id">
                {{ cat.emoji }} {{ cat.label }}
              </option>
            </select>
          </div>

          <!-- Sponsored Settings -->
          <div v-if="isSponsored" class="bg-amber-50 rounded-xl p-5 border border-amber-200">
            <h3 class="font-semibold text-amber-900 mb-3 flex items-center gap-2">
              <span>📢</span> Sponsor Details
            </h3>
            <div class="space-y-3">
              <div>
                <label class="block text-xs font-medium text-amber-700 mb-1">Advertiser</label>
                <input
                  v-model="article.advertiser"
                  type="text"
                  placeholder="Company name"
                  class="w-full px-3 py-2 border border-amber-300 rounded-lg text-sm bg-white"
                />
              </div>
              <div>
                <label class="block text-xs font-medium text-amber-700 mb-1">Sponsor Link</label>
                <input
                  v-model="article.sponsorLink"
                  type="url"
                  placeholder="https://..."
                  class="w-full px-3 py-2 border border-amber-300 rounded-lg text-sm bg-white"
                />
              </div>
            </div>
          </div>

          <!-- Tags -->
          <div class="bg-white rounded-xl p-5 shadow-sm">
            <h3 class="font-semibold text-gray-900 mb-3">Tags</h3>
            <div class="flex flex-wrap gap-2 mb-3">
              <span 
                v-for="(tag, i) in article.tags" 
                :key="i"
                class="inline-flex items-center gap-1 px-2 py-1 bg-amber-100 text-amber-700 rounded-full text-xs"
              >
                {{ tag }}
                <button @click="removeTag(i)" class="hover:text-amber-900">×</button>
              </span>
            </div>
            <div class="flex gap-2">
              <input
                v-model="newTag"
                type="text"
                placeholder="Add tag..."
                class="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm"
                @keyup.enter="addTag"
              />
              <button @click="addTag" class="px-3 py-2 bg-gray-100 rounded-lg text-sm hover:bg-gray-200">
                Add
              </button>
            </div>
          </div>

          <!-- Source -->
          <div class="bg-white rounded-xl p-5 shadow-sm">
            <h3 class="font-semibold text-gray-900 mb-3">Source Attribution</h3>
            <input
              v-model="article.originalSource"
              type="text"
              :placeholder="isSponsored ? 'Sponsored Content' : 'Original source...'"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
            />
            <p class="text-xs text-gray-500 mt-2">Shown as "Originally reported by..."</p>
          </div>

          <!-- Meta -->
          <div class="bg-white rounded-xl p-5 shadow-sm">
            <h3 class="font-semibold text-gray-900 mb-3">Meta</h3>
            <div class="space-y-3 text-sm text-gray-600">
              <div class="flex justify-between">
                <span>Word count:</span>
                <span class="font-medium">{{ wordCount }}</span>
              </div>
              <div class="flex justify-between">
                <span>Read time:</span>
                <span class="font-medium">{{ readTime }} min</span>
              </div>
              <div class="flex justify-between">
                <span>Status:</span>
                <span :class="statusClass">{{ article.status || 'Draft' }}</span>
              </div>
            </div>
          </div>

          <!-- Danger Zone -->
          <div v-if="!isNew" class="bg-white rounded-xl p-5 shadow-sm border border-red-200">
            <h3 class="font-semibold text-red-700 mb-3">Danger Zone</h3>
            <button 
              @click="deleteArticle"
              class="w-full px-4 py-2 bg-red-50 text-red-600 rounded-lg text-sm hover:bg-red-100"
            >
              Delete Article
            </button>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import type { StoryCategory } from '~/types'
import { CORE_CATEGORIES } from '~/utils/constants'
import slugify from 'slugify'

const route = useRoute()
const router = useRouter()

// Check auth
const { data: authCheck } = await useFetch('/api/admin/check')
if (!authCheck.value?.authenticated) {
  await navigateTo('/admin/login')
}

// Determine mode
const articleId = route.params.id as string
const isNew = articleId === 'new'
const isSponsored = route.query.sponsored === 'true'

// Article state
const article = ref({
  title: '',
  summary: '',
  content: '',
  imageUrl: '',
  category: 'good-news' as StoryCategory,
  tags: [] as string[],
  originalSource: isSponsored ? 'Sponsored Content' : '',
  advertiser: '',
  sponsorLink: '',
  status: 'draft',
})

// Load existing article
if (!isNew) {
  const { data } = await useFetch(`/api/admin/articles/${articleId}`)
  if (data.value?.article) {
    article.value = { ...article.value, ...data.value.article }
  }
}

// Tags
const newTag = ref('')
function addTag() {
  if (newTag.value.trim() && !article.value.tags.includes(newTag.value.trim())) {
    article.value.tags.push(newTag.value.trim())
    newTag.value = ''
  }
}
function removeTag(index: number) {
  article.value.tags.splice(index, 1)
}

// Computed
const wordCount = computed(() => {
  const text = article.value.content.replace(/<[^>]*>/g, ' ')
  return text.split(/\s+/).filter(word => word.length > 0).length
})

const readTime = computed(() => Math.max(1, Math.ceil(wordCount.value / 200)))

const canPublish = computed(() => {
  return article.value.title.trim() && 
         article.value.summary.trim() && 
         article.value.content.trim() &&
         wordCount.value >= 50
})

const statusClass = computed(() => {
  if (article.value.status === 'published') return 'text-green-600 font-medium'
  if (article.value.status === 'draft') return 'text-gray-500'
  return 'text-amber-600'
})

// Save
const saving = ref(false)
const autoSaved = ref(false)

async function saveDraft() {
  await saveArticle('draft')
}

async function publish() {
  await saveArticle('published')
}

async function saveArticle(status: string) {
  saving.value = true
  
  try {
    const slug = slugify(article.value.title, { lower: true, strict: true })
    
    const payload = {
      ...article.value,
      slug,
      status,
      readTime: readTime.value,
      featured: false,
      isSponsored,
      publishedAt: status === 'published' ? new Date() : null,
    }
    
    if (isNew) {
      const result = await $fetch('/api/admin/articles', {
        method: 'POST',
        body: payload,
      })
      // Navigate to edit page after creation
      router.replace(`/admin/editor/${result.id}`)
    } else {
      await $fetch(`/api/admin/articles/${articleId}`, {
        method: 'PUT',
        body: payload,
      })
    }
    
    article.value.status = status
    autoSaved.value = true
    setTimeout(() => autoSaved.value = false, 2000)
    
    if (status === 'published') {
      router.push('/admin/articles')
    }
  } catch (e) {
    console.error('Save failed:', e)
    alert('Failed to save article')
  } finally {
    saving.value = false
  }
}

async function deleteArticle() {
  if (!confirm('Are you sure you want to delete this article? This cannot be undone.')) return
  
  try {
    await $fetch(`/api/admin/articles/${articleId}`, { method: 'DELETE' })
    router.push('/admin/articles')
  } catch (e) {
    console.error('Delete failed:', e)
    alert('Failed to delete article')
  }
}

// Auto-save draft every 30 seconds
let autoSaveInterval: ReturnType<typeof setInterval>
onMounted(() => {
  autoSaveInterval = setInterval(() => {
    if (article.value.title && article.value.content && !isNew) {
      saveDraft()
    }
  }, 30000)
})

onBeforeUnmount(() => {
  clearInterval(autoSaveInterval)
})
</script>
