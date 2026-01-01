<template>
  <div>
    <Header />
    
    <main class="max-w-4xl mx-auto px-4 sm:px-6 py-12 sm:py-16">
      <!-- Hero -->
      <div class="text-center mb-12">
        <span class="text-6xl mb-4 block">📢</span>
        <h1 class="text-4xl sm:text-5xl font-bold text-amber-950 font-display mb-4">
          Advertise with Us
        </h1>
        <p class="text-xl text-amber-700/70">
          Reach an engaged audience that values positivity.
        </p>
      </div>

      <!-- Stats -->
      <div class="grid sm:grid-cols-3 gap-6 mb-12">
        <div class="bg-white rounded-2xl p-6 text-center shadow-lg">
          <p class="text-4xl font-bold text-amber-600 mb-2">50K+</p>
          <p class="text-amber-700/70">Monthly Readers</p>
        </div>
        <div class="bg-white rounded-2xl p-6 text-center shadow-lg">
          <p class="text-4xl font-bold text-amber-600 mb-2">4.5 min</p>
          <p class="text-amber-700/70">Avg. Time on Site</p>
        </div>
        <div class="bg-white rounded-2xl p-6 text-center shadow-lg">
          <p class="text-4xl font-bold text-amber-600 mb-2">85%</p>
          <p class="text-amber-700/70">Return Visitors</p>
        </div>
      </div>

      <!-- Why Advertise -->
      <div class="bg-white rounded-2xl p-8 sm:p-10 shadow-lg mb-8">
        <h2 class="text-2xl font-bold text-amber-950 font-display mb-6">Why Advertise on BrightWire?</h2>
        
        <div class="space-y-6">
          <div class="flex items-start gap-4">
            <div class="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center flex-shrink-0">
              <span class="text-2xl">🎯</span>
            </div>
            <div>
              <h3 class="font-bold text-amber-900 mb-1">Engaged Audience</h3>
              <p class="text-amber-700/70">Our readers actively choose positive content. They're engaged, optimistic, and action-oriented.</p>
            </div>
          </div>

          <div class="flex items-start gap-4">
            <div class="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center flex-shrink-0">
              <span class="text-2xl">✨</span>
            </div>
            <div>
              <h3 class="font-bold text-amber-900 mb-1">Brand-Safe Environment</h3>
              <p class="text-amber-700/70">Your brand appears alongside uplifting, positive content — never controversy or negativity.</p>
            </div>
          </div>

          <div class="flex items-start gap-4">
            <div class="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center flex-shrink-0">
              <span class="text-2xl">💚</span>
            </div>
            <div>
              <h3 class="font-bold text-amber-900 mb-1">Values-Aligned Readers</h3>
              <p class="text-amber-700/70">Our audience cares about sustainability, community, innovation, and making a difference.</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Ad Options -->
      <div class="bg-white rounded-2xl p-8 sm:p-10 shadow-lg mb-8">
        <h2 class="text-2xl font-bold text-amber-950 font-display mb-6">Advertising Options</h2>
        
        <div class="space-y-4">
          <div class="border border-amber-200 rounded-xl p-6">
            <div class="flex items-center justify-between mb-2">
              <h3 class="font-bold text-amber-900">Newsletter Sponsorship</h3>
              <span class="bg-amber-100 text-amber-700 px-3 py-1 rounded-full text-sm font-medium">Popular</span>
            </div>
            <p class="text-amber-700/70 mb-3">Featured spot in our daily newsletter reaching 50,000+ subscribers.</p>
            <p class="text-amber-600 font-semibold">Starting at $500/week</p>
          </div>

          <div class="border border-amber-200 rounded-xl p-6">
            <h3 class="font-bold text-amber-900 mb-2">Sponsored Article</h3>
            <p class="text-amber-700/70 mb-3">Native content that tells your brand's positive impact story.</p>
            <p class="text-amber-600 font-semibold">Starting at $1,000/article</p>
          </div>

          <div class="border border-amber-200 rounded-xl p-6">
            <h3 class="font-bold text-amber-900 mb-2">Display Advertising</h3>
            <p class="text-amber-700/70 mb-3">Tasteful banner placements that complement our design.</p>
            <p class="text-amber-600 font-semibold">Starting at $10 CPM</p>
          </div>

          <div class="border border-amber-200 rounded-xl p-6">
            <h3 class="font-bold text-amber-900 mb-2">Category Sponsorship</h3>
            <p class="text-amber-700/70 mb-3">Own an entire category (e.g., "Planet Wins brought to you by...").</p>
            <p class="text-amber-600 font-semibold">Contact for pricing</p>
          </div>
        </div>
      </div>

      <!-- CTA -->
      <div class="bg-gradient-to-r from-amber-500 to-orange-500 rounded-2xl p-8 sm:p-10 text-white text-center">
        <h2 class="text-2xl font-bold font-display mb-4">Ready to Get Started?</h2>
        <p class="mb-6 text-white/90">
          Let's discuss how BrightWire can help tell your brand's positive story.
        </p>
        <a 
          href="mailto:advertise@brightwire.news" 
          class="inline-block bg-white text-amber-600 px-8 py-3 rounded-full font-semibold hover:bg-amber-50 transition-colors"
        >
          Contact Our Ad Team
        </a>
        <p class="mt-4 text-white/70 text-sm">advertise@brightwire.news</p>
      </div>
    </main>

    <Footer />
  </div>
</template>

<script setup>
useHead({
  title: 'Advertise - BrightWire',
  meta: [
    { name: 'description', content: 'Advertise on BrightWire and reach an engaged audience that values positivity and good news.' }
  ]
})
</script>
