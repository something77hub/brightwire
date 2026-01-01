<template>
  <div>
    <Header />

    <!-- Loading -->
    <div v-if="pending" class="max-w-4xl mx-auto px-4 sm:px-6 py-20">
      <div class="flex flex-col items-center justify-center">
        <div class="w-12 h-12 border-4 border-amber-200 border-t-amber-500 rounded-full animate-spin"></div>
        <p class="mt-4 text-amber-700/60">Loading story...</p>
      </div>
    </div>

    <!-- Error -->
    <div v-else-if="error" class="max-w-4xl mx-auto px-4 sm:px-6 py-20 text-center">
      <span class="text-6xl mb-4 block">📰</span>
      <h1 class="text-2xl font-bold text-amber-900 mb-2">Story Not Found</h1>
      <p class="text-amber-700/60 mb-6">This story may have been moved or removed.</p>
      <NuxtLink to="/" class="text-amber-600 hover:text-amber-700 font-medium">
        ← Back to Good News
      </NuxtLink>
    </div>

    <!-- Article -->
    <article v-else-if="story" class="pb-16">
      <!-- Hero Image -->
      <div v-if="story.imageUrl" class="relative h-[40vh] sm:h-[50vh] lg:h-[60vh] overflow-hidden">
        <img 
          :src="story.imageUrl" 
          :alt="story.title"
          class="w-full h-full object-cover"
        />
        <div class="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent"></div>
      </div>

      <!-- Article Content -->
      <div class="max-w-4xl mx-auto px-4 sm:px-6">
        <!-- Header -->
        <header class="py-8 sm:py-12" :class="{ '-mt-32 sm:-mt-40 relative z-10': story.imageUrl }">
          <div :class="{ 'bg-white rounded-2xl p-6 sm:p-8 shadow-xl': story.imageUrl }">
            <!-- Category Badge -->
            <div class="flex items-center gap-3 mb-4">
              <span 
                class="inline-flex items-center gap-2 px-4 py-2 rounded-full text-white text-sm font-semibold shadow-md"
                :class="categoryBadgeClass"
              >
                <span>{{ categoryEmoji }}</span>
                {{ formatCategory(story.category) }}
              </span>
            </div>

            <!-- Title -->
            <h1 class="text-3xl sm:text-4xl lg:text-5xl font-bold text-amber-950 leading-tight font-display mb-6">
              {{ story.title }}
            </h1>

            <!-- Meta -->
            <div class="flex flex-wrap items-center gap-4 text-amber-700/70 text-sm">
              <div class="flex items-center gap-2">
                <div class="w-8 h-8 bg-gradient-to-br from-amber-400 to-orange-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
                  {{ authorInitials }}
                </div>
                <span class="font-medium text-amber-900">{{ story.author }}</span>
              </div>
              <span class="w-1 h-1 bg-amber-300 rounded-full"></span>
              <time :datetime="story.publishedAt">{{ formattedDate }}</time>
              <span class="w-1 h-1 bg-amber-300 rounded-full"></span>
              <span>{{ story.readTime }} min read</span>
            </div>

            <!-- Tags -->
            <div v-if="story.tags?.length" class="flex flex-wrap gap-2 mt-4">
              <span 
                v-for="tag in story.tags" 
                :key="tag"
                class="px-3 py-1 bg-amber-100/50 text-amber-700 text-xs font-medium rounded-full"
              >
                #{{ tag }}
              </span>
            </div>
          </div>
        </header>

        <!-- Summary/Lead -->
        <div class="mb-8">
          <p class="text-xl sm:text-2xl text-amber-800 leading-relaxed font-light">
            {{ story.summary }}
          </p>
        </div>

        <!-- Video Player -->
        <div v-if="story.videoEmbedUrl" class="mb-10">
          <div class="relative w-full rounded-2xl overflow-hidden shadow-xl bg-black" style="padding-bottom: 56.25%;">
            <iframe 
              :src="story.videoEmbedUrl"
              class="absolute top-0 left-0 w-full h-full"
              frameborder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowfullscreen
            ></iframe>
          </div>
          <p class="text-amber-600/50 text-sm mt-3 text-center">
            📺 Watch the full story above
          </p>
        </div>



        <!-- Main Content -->
        <div 
          class="prose prose-lg prose-amber max-w-none
                 prose-headings:font-display prose-headings:text-amber-950
                 prose-p:text-amber-900/80 prose-p:leading-relaxed
                 prose-a:text-amber-600 prose-a:no-underline hover:prose-a:underline
                 prose-strong:text-amber-900 prose-strong:font-semibold
                 prose-img:rounded-xl prose-img:shadow-lg prose-img:my-8
                 prose-blockquote:border-amber-400 prose-blockquote:bg-amber-50/50 
                 prose-blockquote:py-1 prose-blockquote:rounded-r-lg"
          v-html="renderedContent"
        ></div>

        <!-- Source Attribution & Transparency -->
        <div class="mt-12 pt-8 border-t border-amber-200/50 space-y-4">
          <!-- Original Source (no link) -->
          <div class="flex items-start gap-3">
            <svg class="w-5 h-5 text-amber-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
            </svg>
            <div>
              <p class="text-amber-600/70 text-sm">
                Based on reporting by <span class="font-medium text-amber-700">{{ story.originalSource }}</span>
              </p>
            </div>
          </div>

          <!-- AI Transparency Notice -->
          <div class="flex items-start gap-3 bg-amber-50/50 rounded-lg p-4">
            <svg class="w-5 h-5 text-amber-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
            <div class="text-sm">
              <p class="text-amber-600/80">
                This story was written by BrightWire based on verified news reports.
              </p>
            </div>
          </div>
        </div>

        <!-- In-Article Ad (Self-managed first, then GAM fallback) -->
        <div class="my-8">
          <ClientOnly>
            <UnifiedAd placement="article-bottom" :category="story.category" />
          </ClientOnly>
        </div>

        <!-- Share Section -->
        <div class="mt-12 p-6 bg-gradient-to-r from-amber-50 to-orange-50 rounded-2xl border border-amber-200/50">
          <div class="text-center mb-4">
            <h3 class="text-lg font-semibold text-amber-900">Spread the positivity! 🌟</h3>
            <p class="text-amber-700/70 text-sm">Share this good news with someone who needs it</p>
          </div>
          <div class="flex flex-wrap justify-center gap-2 sm:gap-3">
            <button 
              @click="shareWhatsApp"
              class="flex items-center gap-2 px-4 py-2.5 bg-[#25D366] hover:bg-[#20BD5A] text-white rounded-xl transition-colors font-medium text-sm shadow-md"
              aria-label="Share on WhatsApp"
            >
              <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
              </svg>
              WhatsApp
            </button>
            <button 
              @click="shareTwitter"
              class="flex items-center gap-2 px-4 py-2.5 bg-black hover:bg-gray-800 text-white rounded-xl transition-colors font-medium text-sm shadow-md"
              aria-label="Share on X"
            >
              <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
              </svg>
              X
            </button>
            <button 
              @click="shareFacebook"
              class="flex items-center gap-2 px-4 py-2.5 bg-[#1877F2] hover:bg-[#166FE5] text-white rounded-xl transition-colors font-medium text-sm shadow-md"
              aria-label="Share on Facebook"
            >
              <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
              </svg>
              Facebook
            </button>
            <button 
              @click="copyLink"
              class="flex items-center gap-2 px-4 py-2.5 bg-amber-500 hover:bg-amber-600 text-white rounded-xl transition-colors font-medium text-sm shadow-md"
              :class="{ '!bg-emerald-500': copied }"
              aria-label="Copy link"
            >
              <svg v-if="!copied" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
              <svg v-else class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
              </svg>
              {{ copied ? 'Copied!' : 'Copy' }}
            </button>
          </div>
          
          <!-- Quote Card Button -->
          <div class="mt-4 text-center">
            <button 
              @click="showQuoteModal = true"
              class="inline-flex items-center gap-2 px-4 py-2 text-amber-700 hover:text-amber-900 text-sm font-medium transition-colors"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span class="hidden sm:inline">Create Quote Card for Stories</span>
              <span class="sm:hidden">Create Quote Card</span>
            </button>
          </div>
        </div>

        <Teleport to="body">
          <div v-if="showQuoteModal" class="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-0 sm:p-4" @click.self="showQuoteModal = false">
            <div class="bg-white w-full h-full sm:h-auto sm:max-h-[90vh] sm:rounded-2xl shadow-xl flex flex-col max-w-lg mx-auto overflow-hidden">
              
              <!-- Header -->
              <div class="px-4 py-3 border-b border-gray-100 flex items-center justify-between bg-white shrink-0">
                <h3 class="text-lg font-semibold text-gray-900">Create Quote Card</h3>
                <button @click="showQuoteModal = false" class="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-full transition-colors">
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
                  </svg>
                </button>
              </div>
              
              <!-- Scrollable Content -->
              <div class="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5">
                <!-- Preview - Prominent at top -->
                <div class="border border-gray-200 rounded-xl overflow-hidden bg-gray-50 aspect-video relative group">
                  <img 
                    v-if="quoteText"
                    :src="quoteCardUrl"
                    alt="Quote card preview"
                    class="w-full h-full object-contain"
                  />
                  <div v-else class="absolute inset-0 flex items-center justify-center text-gray-400 text-sm">
                    Enter text to preview
                  </div>
                  <!-- Download hint overlay -->
                  <div v-if="quoteText" class="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors pointer-events-none" />
                </div>

                <!-- Inputs -->
                <div class="space-y-4">
                  <div>
                    <div class="flex items-center justify-between mb-2">
                       <label class="text-sm font-medium text-gray-700">Quote Text</label>
                       <span class="text-xs text-gray-400">{{ quoteText.length }}/400</span>
                    </div>
                    <textarea
                      v-model="quoteText"
                      rows="4"
                      maxlength="400"
                      class="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-shadow resize-none"
                      placeholder="Paste a quote or type your own..."
                    ></textarea>
                    
                    <!-- Quick Actions -->
                    <div class="flex gap-2 mt-2 overflow-x-auto pb-1 no-scrollbar">
                      <button 
                        @click="quoteText = story?.title || ''"
                        class="shrink-0 px-3 py-1.5 text-xs font-medium bg-amber-50 text-amber-700 hover:bg-amber-100 rounded-lg transition-colors border border-amber-100"
                      >
                        Use Title
                      </button>
                      <button 
                        @click="quoteText = story?.summary || ''"
                        class="shrink-0 px-3 py-1.5 text-xs font-medium bg-amber-50 text-amber-700 hover:bg-amber-100 rounded-lg transition-colors border border-amber-100"
                      >
                         Use Summary
                      </button>
                      <button 
                        v-if="quoteText"
                        @click="quoteText = ''"
                        class="shrink-0 px-3 py-1.5 text-xs font-medium text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                      >
                         Clear
                      </button>
                    </div>
                  </div>

                  <!-- Style Options -->
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">Background Style</label>
                    <div class="grid grid-cols-2 gap-3">
                      <button
                        @click="useHeroBackground = false"
                        class="flex items-center justify-center gap-2 px-4 py-2.5 border rounded-xl text-sm font-medium transition-all"
                        :class="!useHeroBackground ? 'border-amber-500 bg-amber-50 text-amber-700 ring-1 ring-amber-500' : 'border-gray-200 text-gray-600 hover:border-gray-300 hover:bg-gray-50'"
                      >
                        <span class="text-lg">🎨</span> Solid
                      </button>
                      <button
                        @click="useHeroBackground = true"
                        :disabled="!story?.imageUrl"
                        class="flex items-center justify-center gap-2 px-4 py-2.5 border rounded-xl text-sm font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        :class="useHeroBackground ? 'border-amber-500 bg-amber-50 text-amber-700 ring-1 ring-amber-500' : 'border-gray-200 text-gray-600 hover:border-gray-300 hover:bg-gray-50'"
                      >
                        <span class="text-lg">🖼️</span> Image
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Footer Actions -->
              <div class="p-4 bg-gray-50 border-t border-gray-100 grid grid-cols-[1fr_auto_auto] gap-2 shrink-0">
                <button 
                  @click="downloadQuoteCardAsPng"
                  :disabled="!quoteText"
                  class="flex items-center justify-center gap-2 px-4 py-2.5 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-sm font-medium transition-colors disabled:opacity-50 shadow-sm active:scale-95 transform duration-150"
                >
                  Download PNG
                </button>
                <button 
                  @click="shareQuoteCardToTwitter"
                  :disabled="!quoteText"
                  class="p-2.5 bg-black hover:bg-gray-800 text-white rounded-xl disabled:opacity-50 transition-colors"
                  title="Share to X"
                >
                  <svg class="w-5 h-5" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
                </button>
                <button 
                  @click="shareQuoteCard"
                  :disabled="!quoteText"
                  class="p-2.5 bg-[#25D366] hover:bg-[#20BD5A] text-white rounded-xl disabled:opacity-50 transition-colors"
                  title="Share to WhatsApp"
                >
                  <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                </button>
              </div>
            </div>
          </div>
        </Teleport>

        <!-- Floating Share Bar (appears on scroll) -->
        <Teleport to="body">
          <Transition
            enter-active-class="transition-transform duration-300 ease-out"
            enter-from-class="translate-y-full"
            enter-to-class="translate-y-0"
            leave-active-class="transition-transform duration-200 ease-in"
            leave-from-class="translate-y-0"
            leave-to-class="translate-y-full"
          >
            <div 
              v-if="showFloatingShare"
              class="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 bg-white/95 backdrop-blur-lg rounded-full shadow-2xl border border-amber-200/50 px-4 py-2 flex items-center gap-3"
            >
              <span class="text-amber-700 text-sm font-medium hidden sm:block">Share:</span>
              <button @click="shareWhatsApp" class="p-2 hover:bg-amber-100 rounded-full transition-colors text-[#25D366]">
                <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
              </button>
              <button @click="shareTwitter" class="p-2 hover:bg-amber-100 rounded-full transition-colors text-black">
                <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
              </button>
              <button @click="shareFacebook" class="p-2 hover:bg-amber-100 rounded-full transition-colors text-[#1877F2]">
                <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
              </button>
              <button @click="copyLink" class="p-2 hover:bg-amber-100 rounded-full transition-colors" :class="copied ? 'text-emerald-500' : 'text-amber-600'">
                <svg v-if="!copied" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
                <svg v-else class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" /></svg>
              </button>
            </div>
          </Transition>
        </Teleport>
      </div>

      <!-- Related Stories -->
      <section v-if="relatedStories.length" class="max-w-7xl mx-auto px-4 sm:px-6 mt-16 pt-12 border-t border-amber-200/30">
        <h2 class="text-2xl font-bold text-amber-950 mb-8 font-display">More Good News</h2>
        <div class="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <StoryCard 
            v-for="(item, index) in relatedStories" 
            :key="item.slug"
            :story="item"
            :index="index"
          />
        </div>
        
        <div v-if="hasMoreRelated" class="mt-10 text-center">
          <button
            @click="loadMoreRelated"
            :disabled="loadingRelated"
            class="group inline-flex items-center gap-2 px-8 py-3 bg-white border border-amber-200 hover:border-amber-300 text-amber-800 font-semibold rounded-full shadow-sm hover:shadow-md transition-all duration-300 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            <span v-if="loadingRelated" class="flex items-center gap-2">
              <svg class="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Loading...
            </span>
            <span v-else class="flex items-center gap-2">
              Load More Stories
              <svg class="w-4 h-4 group-hover:translate-y-0.5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/>
              </svg>
            </span>
          </button>
        </div>
        <div v-else class="mt-10 text-center text-amber-900/40 text-sm font-medium italic">
          You're all caught up! ✨
        </div>
      </section>

      <!-- Newsletter -->
      <div id="newsletter" class="max-w-4xl mx-auto px-4 sm:px-6">
        <Newsletter />
      </div>
    </article>

    <Footer />
  </div>
</template>

<script setup lang="ts">
import type { Story } from '~/types'

const route = useRoute()
const config = useRuntimeConfig()

// Get site URL from database settings (not just env var)
const { siteUrl } = await useSiteSettings()

const slug = computed(() => route.params.slug as string)
const copied = ref(false)

// Fetch story
const { data, pending, error } = await useFetch(`/api/stories/${slug.value}`)

const story = computed(() => data.value?.story as Story | undefined)

// Related stories state
const relatedStories = ref<Story[]>([])
const loadingRelated = ref(false)
const relatedPage = ref(1)
const hasMoreRelated = ref(true)

// Initialize related stories from server response
watch(() => data.value?.related, (newRelated) => {
  if (newRelated && relatedStories.value.length === 0) {
    relatedStories.value = newRelated as Story[]
  }
}, { immediate: true })

async function loadMoreRelated() {
  if (loadingRelated.value || !story.value) return
  
  loadingRelated.value = true
  try {
    const response = await $fetch(`/api/category/${story.value.category}`, {
      query: { 
        page: relatedPage.value,
        limit: 6 
      }
    }) as any
    
    if (response?.stories) {
      const currentIds = new Set(relatedStories.value.map(s => s._id || s.guid))
      // Add current main story to filtered IDs to avoid showing it in related
      if (story.value._id) currentIds.add(story.value._id)
      
      const newStories = response.stories.filter((s: any) => !currentIds.has(s._id || s.guid))
      
      if (newStories.length > 0) {
        relatedStories.value.push(...newStories)
        relatedPage.value++
      } else {
         // If we fetched stories but they were all duplicates, try next page
         if (response.pagination?.hasMore) {
            relatedPage.value++
            // Optimization: could recursively call loadMoreRelated(), but let's let user click again or just stop
         }
      }
      
      hasMoreRelated.value = response.pagination?.hasMore || false
    }
  } catch (e) {
    console.error('Failed to load more related:', e)
  } finally {
    loadingRelated.value = false
  }
}

// Category styling
const categoryEmojis: Record<string, string> = {
  'good-news': '✨',
  'heroes': '🦸',
  'planet': '🌍',
  'innovation': '🚀',
  'solutions': '💡',
  'kindness': '💛',
  'sports': '🏆',
}

const categoryBadgeColors: Record<string, string> = {
  'good-news': 'bg-amber-500 text-white',
  'heroes': 'bg-rose-500 text-white',
  'planet': 'bg-emerald-500 text-white',
  'innovation': 'bg-violet-500 text-white',
  'solutions': 'bg-blue-500 text-white',
  'kindness': 'bg-yellow-500 text-white',
  'sports': 'bg-orange-600 text-white',
}

const categoryEmoji = computed(() => 
  story.value ? categoryEmojis[story.value.category] || '✨' : '✨'
)

const categoryBadgeClass = computed(() =>
  story.value ? categoryBadgeColors[story.value.category] || 'bg-amber-500' : 'bg-amber-500'
)

const authorInitials = computed(() => {
  if (!story.value?.author) return 'BW'
  const names = story.value.author.trim().split(' ')
  if (names.length >= 2) {
    return (names[0][0] + names[names.length - 1][0]).toUpperCase()
  }
  return names[0].substring(0, 2).toUpperCase()
})

// Format date
const formattedDate = computed(() => {
  if (!story.value) return ''
  return new Date(story.value.publishedAt).toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
})

// Render markdown content to HTML with inline images
const renderedContent = computed(() => {
  if (!story.value?.content) return ''
  
  let html = story.value.content
    // Convert [IMG:url] markers to image tags (must do before paragraph processing)
    .replace(/\[IMG:(https?:\/\/[^\]]+)\]/g, '</p><figure class="my-8"><img src="$1" alt="" class="w-full rounded-xl shadow-lg" loading="lazy" /></figure><p>')
    // Convert [P] paragraph markers to proper breaks
    .replace(/\[P\]/g, '\n\n')
    // Headers
    .replace(/^### (.*$)/gim, '<h3>$1</h3>')
    .replace(/^## (.*$)/gim, '<h2>$1</h2>')
    .replace(/^# (.*$)/gim, '<h1>$1</h1>')
    // Bold
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    // Italic
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    // Paragraphs
    .replace(/\n\n/g, '</p><p>')
    // Line breaks
    .replace(/\n/g, '<br>')
  
  // Clean up empty paragraphs that might result from image placement
  html = html.replace(/<p>\s*<\/p>/g, '')
  
  return `<p>${html}</p>`
})

// Format category name
function formatCategory(category: string): string {
  const labels: Record<string, string> = {
    'good-news': "Today's Good News",
    'heroes': 'Community Heroes',
    'planet': 'Planet Wins',
    'innovation': 'Innovation',
    'solutions': 'Solutions',
    'sports': 'Sports & Athletics',
  }
  return labels[category] || 'Good News'
}

// Share functions
function shareTwitter() {
  const url = `${siteUrl.value}/article/${slug.value}`
  const text = story.value?.title || 'Good news from BrightWire'
  window.open(
    `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`,
    '_blank'
  )
}

function shareFacebook() {
  const url = `${siteUrl.value}/article/${slug.value}`
  window.open(
    `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
    '_blank'
  )
}

function shareWhatsApp() {
  const url = `${siteUrl.value}/article/${slug.value}`
  const text = `${story.value?.title || 'Good news'} - Check out this positive story! 🌟`
  window.open(
    `https://wa.me/?text=${encodeURIComponent(text + '\n\n' + url)}`,
    '_blank'
  )
}

async function copyLink() {
  const url = `${siteUrl.value}/article/${slug.value}`
  try {
    await navigator.clipboard.writeText(url)
    copied.value = true
    setTimeout(() => { copied.value = false }, 2000)
  } catch (e) {
    console.error('Failed to copy:', e)
  }
}

// Floating share bar visibility
const showFloatingShare = ref(false)
const scrollY = ref(0)

onMounted(() => {
  const handleScroll = () => {
    scrollY.value = window.scrollY
    // Show after scrolling 500px and hide near bottom
    const docHeight = document.documentElement.scrollHeight
    const windowHeight = window.innerHeight
    const nearBottom = scrollY.value + windowHeight > docHeight - 300
    showFloatingShare.value = scrollY.value > 500 && !nearBottom
  }
  
  window.addEventListener('scroll', handleScroll, { passive: true })
  
  onUnmounted(() => {
    window.removeEventListener('scroll', handleScroll)
  })
})

// Quote card
const showQuoteModal = ref(false)
const quoteText = ref('')
const useHeroBackground = ref(false)

const refreshKey = ref(0)
watch(showQuoteModal, (val) => {
  if (val) refreshKey.value = Date.now()
})

const quoteCardUrl = computed(() => {
  if (!quoteText.value) return ''
  const params = new URLSearchParams({
    quote: quoteText.value,
    source: story.value?.originalSource || 'BrightWire',
    category: story.value?.category || 'good-news',
    _t: refreshKey.value.toString() // Cache busting
  })
  
  // Add background image if enabled
  if (useHeroBackground.value && story.value?.imageUrl) {
    params.set('bg', story.value.imageUrl)
  }
  
  return `/api/quote-card.png?${params.toString()}`
})

function shareQuoteCard() {
  const articleUrl = `${siteUrl.value}/article/${slug.value}`
  const text = `"${quoteText.value}"\n\n🌟 Read more: ${articleUrl}`
  window.open(
    `https://wa.me/?text=${encodeURIComponent(text)}`,
    '_blank'
  )
}

function shareQuoteCardToTwitter() {
  const articleUrl = `${siteUrl.value}/article/${slug.value}`
  // Truncate quote for Twitter if needed
  const maxQuoteLength = 200
  const truncatedQuote = quoteText.value.length > maxQuoteLength 
    ? quoteText.value.slice(0, maxQuoteLength - 3) + '...'
    : quoteText.value
  const text = `"${truncatedQuote}"\n\n🌟 ${articleUrl}`
  window.open(
    `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`,
    '_blank',
    'width=550,height=420'
  )
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
  } catch (e) {
    console.error('Failed to download PNG:', e)
    // Fallback: open SVG in new tab
    window.open(quoteCardUrl.value, '_blank')
  }
}

// SEO
const articleUrl = computed(() => `${siteUrl.value}/article/${slug.value}`)

// Generate JSON-LD structured data for NewsArticle
const jsonLd = computed(() => {
  if (!story.value) return null
  
  const data: Record<string, any> = {
    '@context': 'https://schema.org',
    '@type': 'NewsArticle',
    'headline': story.value.title.substring(0, 110), // Google recommends < 110 chars
    'description': story.value.summary,
    'datePublished': new Date(story.value.publishedAt).toISOString(),
    'dateModified': new Date(story.value.createdAt || story.value.publishedAt).toISOString(),
    'author': {
      '@type': 'Person',
      'name': story.value.author || 'BrightWire Staff',
      'url': siteUrl.value,
    },
    'publisher': {
      '@type': 'Organization',
      'name': 'BrightWire',
      'url': siteUrl.value,
      'logo': {
        '@type': 'ImageObject',
        'url': `${siteUrl.value}/api/logo.png`,
        'width': 600,
        'height': 60,
      },
    },
    'mainEntityOfPage': {
      '@type': 'WebPage',
      '@id': articleUrl.value,
    },
    'articleSection': formatCategory(story.value.category),
    'inLanguage': 'en-US',
    'speakable': {
      '@type': 'SpeakableSpecification',
      'cssSelector': ['h1', 'p.text-xl'] // Target title and summary
    },
  }
  
  // Add image if available (required for rich results)
  if (story.value.imageUrl) {
    data.image = {
      '@type': 'ImageObject',
      'url': story.value.imageUrl,
      'width': 1200,
      'height': 630,
    }
  }
  
  // Add keywords/tags
  if (story.value.tags?.length) {
    data.keywords = story.value.tags.join(', ')
  }
  
  // Add word count estimate (helps with rich results)
  if (story.value.content) {
    data.wordCount = story.value.content.split(/\s+/).length
  }
  
  return data
})

// Generate BreadcrumbList schema
const breadcrumbLd = computed(() => {
  if (!story.value) return null
  
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    'itemListElement': [
      {
        '@type': 'ListItem',
        'position': 1,
        'name': 'Home',
        'item': siteUrl.value,
      },
      {
        '@type': 'ListItem',
        'position': 2,
        'name': formatCategory(story.value.category),
        'item': `${siteUrl.value}/category/${story.value.category}`,
      },
      {
        '@type': 'ListItem',
        'position': 3,
        'name': story.value.title.substring(0, 50),
      },
    ],
  }
})

useHead({
  title: computed(() => story.value ? `${story.value.title} - BrightWire` : 'BrightWire'),
  meta: [
    { name: 'description', content: computed(() => story.value?.summary || '') },
    { name: 'author', content: computed(() => story.value?.author || 'BrightWire') },
    // Open Graph - Dynamic headline image for better CTR!
    { property: 'og:type', content: 'article' },
    { property: 'og:title', content: computed(() => story.value?.title || 'BrightWire') },
    { property: 'og:description', content: computed(() => story.value?.summary || '') },
    { property: 'og:image', content: computed(() => {
      if (story.value?.imageUrl) return story.value.imageUrl
      
      // Fallback: Generate dynamic OG image
      const params = new URLSearchParams({
        type: 'article',
        title: story.value?.title || '',
        category: story.value?.category || 'good-news',
      })
      return `${siteUrl.value}/api/og.png?${params.toString()}`
    }) },
    { property: 'og:image:width', content: '1200' },
    { property: 'og:image:height', content: '630' },
    { property: 'og:url', content: articleUrl },
    { property: 'og:site_name', content: 'BrightWire' },
    { property: 'article:published_time', content: computed(() => story.value?.publishedAt ? new Date(story.value.publishedAt).toISOString() : '') },
    { property: 'article:author', content: computed(() => story.value?.author || 'BrightWire') },
    { property: 'article:section', content: computed(() => formatCategory(story.value?.category || 'good-news')) },
    // Twitter - Dynamic headline image for better CTR!
    { name: 'twitter:card', content: 'summary_large_image' },
    { name: 'twitter:title', content: computed(() => story.value?.title || 'BrightWire') },
    { name: 'twitter:description', content: computed(() => story.value?.summary || '') },
    { name: 'twitter:image', content: computed(() => {
      if (story.value?.imageUrl) return story.value.imageUrl

      const params = new URLSearchParams({
        type: 'article',
        title: story.value?.title || '',
        category: story.value?.category || 'good-news',
      })
      return `${siteUrl.value}/api/og.png?${params.toString()}`
    }) },
  ],
  link: [
    { rel: 'canonical', href: articleUrl },
  ],
  script: computed(() => {
    const scripts = []
    if (jsonLd.value) {
      scripts.push({
        type: 'application/ld+json',
        innerHTML: JSON.stringify(jsonLd.value),
      })
    }
    if (breadcrumbLd.value) {
      scripts.push({
        type: 'application/ld+json',
        innerHTML: JSON.stringify(breadcrumbLd.value),
      })
    }
    return scripts
  }),
})
</script>

<style>
/* Prose customization */
.prose p {
  margin-bottom: 1.5em;
}

.prose h2 {
  margin-top: 2em;
  margin-bottom: 1em;
}
</style>
