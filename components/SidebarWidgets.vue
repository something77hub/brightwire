<template>
  <div class="space-y-6">
    <!-- Joke of the Day -->
    <div class="bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl p-5 shadow-lg border border-amber-200/50">
      <div class="flex items-center gap-2 mb-4">
        <span class="text-2xl">😄</span>
        <h3 class="font-bold text-amber-950">Joke of the Day</h3>
      </div>
      <div class="space-y-3">
        <p class="text-amber-900 text-sm leading-relaxed italic">"{{ siteSettings?.jokeText || "Why don't scientists trust atoms? Because they make up everything!" }}"</p>
        <div class="flex gap-2">
          <button 
            @click="shareText(siteSettings?.jokeText || `Why don't scientists trust atoms? Because they make up everything!`, 'whatsapp')"
            class="w-8 h-8 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center hover:bg-emerald-200 transition-colors"
            title="Share on WhatsApp"
          >
            <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
          </button>
          <button 
            @click="shareText(siteSettings?.jokeText || `Why don't scientists trust atoms? Because they make up everything!`, 'twitter')"
            class="w-8 h-8 rounded-full bg-gray-100 text-gray-900 flex items-center justify-center hover:bg-gray-200 transition-colors"
            title="Share on X"
          >
            <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
          </button>
          <button 
            @click="shareText(siteSettings?.jokeText || `Why don't scientists trust atoms? Because they make up everything!`, 'copy')"
            class="w-8 h-8 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center hover:bg-amber-200 transition-colors"
            title="Copy to clipboard"
          >
            <svg v-if="!copiedState.joke" class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
            <svg v-else class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" /></svg>
          </button>
        </div>
      </div>
    </div>

    <!-- Categories Quick Links -->
    <div class="bg-white rounded-2xl p-5 shadow-lg">
      <h3 class="font-bold text-amber-950 mb-4">Explore Categories</h3>
      <div class="space-y-2">
        <NuxtLink 
          v-for="cat in categories" 
          :key="cat.id"
          :to="cat.id === 'all' ? '/' : `/category/${cat.id}`"
          class="flex items-center gap-3 p-2 rounded-lg hover:bg-amber-50 transition-colors"
        >
          <span class="text-xl">{{ cat.emoji }}</span>
          <span class="text-amber-800 text-sm font-medium">{{ cat.label }}</span>
        </NuxtLink>
      </div>
    </div>

    <!-- Sidebar Ad (Self-managed first, then GAM fallback) -->
    <ClientOnly>
      <UnifiedAd placement="sidebar" />
    </ClientOnly>

    <!-- Quote of the Day -->
    <div class="bg-white rounded-2xl p-5 shadow-lg border border-amber-100">
      <div class="flex items-center gap-2 mb-4">
        <svg class="w-5 h-5 text-amber-500" fill="currentColor" viewBox="0 0 24 24">
          <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z"/>
        </svg>
        <h3 class="font-bold text-amber-950">Quote of the Day</h3>
      </div>
      <div class="bg-gradient-to-br from-amber-50 to-orange-50 p-4 rounded-lg border-l-4 border-amber-500">
        <p class="text-amber-900 text-sm leading-relaxed mb-2">"{{ siteSettings?.quoteText || "The only way to do great work is to love what you do." }}"</p>
        <p class="text-xs text-amber-600 font-medium">&mdash; {{ siteSettings?.quoteAuthor || "Steve Jobs" }}</p>
        
        <!-- Share Quote -->
        <div class="flex gap-2 mt-3 pt-3 border-t border-amber-200/50">
          <button 
            @click="shareText(`&quot;${siteSettings?.quoteText || 'The only way to do great work is to love what you do.'}&quot; \n\u2014 ${siteSettings?.quoteAuthor || 'Steve Jobs'}`, 'whatsapp')"
            class="w-7 h-7 rounded-full bg-white/50 text-emerald-600 flex items-center justify-center hover:bg-white transition-colors"
            title="Share on WhatsApp"
          >
            <svg class="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
          </button>
          <button 
            @click="shareText(`&quot;${siteSettings?.quoteText || 'The only way to do great work is to love what you do.'}&quot; \n\u2014 ${siteSettings?.quoteAuthor || 'Steve Jobs'}`, 'twitter')"
            class="w-7 h-7 rounded-full bg-white/50 text-gray-900 flex items-center justify-center hover:bg-white transition-colors"
            title="Share on X"
          >
            <svg class="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
          </button>
          <button 
            @click="shareText(`&quot;${siteSettings?.quoteText || 'The only way to do great work is to love what you do.'}&quot; \n\u2014 ${siteSettings?.quoteAuthor || 'Steve Jobs'}`, 'copy', 'quote')"
            class="w-7 h-7 rounded-full bg-white/50 text-amber-700 flex items-center justify-center hover:bg-white transition-colors"
            title="Copy to clipboard"
          >
            <svg v-if="!copiedState.quote" class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
            <svg v-else class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" /></svg>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { CORE_CATEGORIES } from '~/utils/constants'

// Get site settings
const { data: siteSettings } = await useFetch('/api/site-settings')

const categories = [
    { id: 'all', label: 'All Stories', emoji: '✅' },
  ...CORE_CATEGORIES.map(c => ({
    id: c.id,
    label: c.label,
    emoji: c.emoji
  }))
]

const copiedState = reactive({
  joke: false,
  quote: false
})

const shareText = (text: string, platform: 'whatsapp' | 'twitter' | 'copy', type: 'joke' | 'quote' = 'joke') => {
  const fullText = `${text}\n\n🌟 Daily good news at BrightWire: https://brightwire.news`
  
  if (platform === 'whatsapp') {
    window.open(`https://wa.me/?text=${encodeURIComponent(fullText)}`, '_blank')
  } else if (platform === 'twitter') {
    window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(fullText)}`, '_blank')
  } else if (platform === 'copy') {
    navigator.clipboard.writeText(fullText).then(() => {
      copiedState[type] = true
      setTimeout(() => {
        copiedState[type] = false
      }, 2000)
    })
  }
}
</script>
