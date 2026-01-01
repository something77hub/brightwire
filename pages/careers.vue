<template>
  <div>
    <Header />
    
    <main class="max-w-4xl mx-auto px-4 sm:px-6 py-12 sm:py-16">
      <!-- Hero -->
      <div class="text-center mb-12">
        <span class="text-6xl mb-4 block">💼</span>
        <h1 class="text-4xl sm:text-5xl font-bold text-amber-950 font-display mb-4">
          Join BrightWire
        </h1>
        <p class="text-xl text-amber-700/70">
          Help us spread good news to the world.
        </p>
      </div>

      <!-- Why Join -->
      <div class="bg-white rounded-2xl p-8 sm:p-10 shadow-lg mb-8">
        <h2 class="text-2xl font-bold text-amber-950 font-display mb-6">Why Work With Us?</h2>
        
        <div class="grid sm:grid-cols-2 gap-6">
          <div class="flex items-start gap-4">
            <span class="text-2xl">🌍</span>
            <div>
              <h3 class="font-bold text-amber-900">Remote-First</h3>
              <p class="text-amber-700/70 text-sm">Work from anywhere in the world.</p>
            </div>
          </div>
          <div class="flex items-start gap-4">
            <span class="text-2xl">⏰</span>
            <div>
              <h3 class="font-bold text-amber-900">Flexible Hours</h3>
              <p class="text-amber-700/70 text-sm">We care about output, not hours logged.</p>
            </div>
          </div>
          <div class="flex items-start gap-4">
            <span class="text-2xl">📚</span>
            <div>
              <h3 class="font-bold text-amber-900">Learning Budget</h3>
              <p class="text-amber-700/70 text-sm">$1,000/year for courses and conferences.</p>
            </div>
          </div>
          <div class="flex items-start gap-4">
            <span class="text-2xl">🏖️</span>
            <div>
              <h3 class="font-bold text-amber-900">Unlimited PTO</h3>
              <p class="text-amber-700/70 text-sm">Take the time you need to recharge.</p>
            </div>
          </div>
          <div class="flex items-start gap-4">
            <span class="text-2xl">💰</span>
            <div>
              <h3 class="font-bold text-amber-900">Competitive Pay</h3>
              <p class="text-amber-700/70 text-sm">Market-rate salaries, transparent bands.</p>
            </div>
          </div>
          <div class="flex items-start gap-4">
            <span class="text-2xl">☀️</span>
            <div>
              <h3 class="font-bold text-amber-900">Meaningful Work</h3>
              <p class="text-amber-700/70 text-sm">Make people's days brighter.</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Open Positions -->
      <div class="bg-white rounded-2xl p-8 sm:p-10 shadow-lg mb-8">
        <h2 class="text-2xl font-bold text-amber-950 font-display mb-6">Open Positions</h2>
        
        <div class="space-y-4">
          <!-- Social Media Manager - OPEN -->
          <div class="border-2 border-amber-400 rounded-xl p-6 bg-amber-50/50">
            <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-3">
              <h3 class="font-bold text-amber-900 text-lg">Social Media Manager</h3>
              <div class="flex gap-2">
                <span class="bg-amber-100 text-amber-700 px-3 py-1 rounded-full text-xs font-medium">Remote</span>
                <span class="bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full text-xs font-medium">Full-time</span>
              </div>
            </div>
            <p class="text-amber-700/70 text-sm mb-4">
              Grow our social presence with engaging, positive content. You'll be responsible for managing our Twitter/X, Instagram, TikTok, and other platforms. Experience with news/media a plus.
            </p>
            <a 
              href="mailto:careers@brightwire.news?subject=Application: Social Media Manager" 
              class="inline-flex items-center gap-2 bg-gradient-to-r from-amber-500 to-orange-500 text-white px-6 py-2 rounded-full font-semibold hover:shadow-lg hover:shadow-amber-500/25 transition-all text-sm"
            >
              Apply Now
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </a>
          </div>
        </div>
      </div>

      <!-- No Fit? -->
      <div class="bg-amber-50 rounded-2xl p-8 sm:p-10 text-center">
        <h2 class="text-xl font-bold text-amber-900 mb-4">Don't See the Right Role?</h2>
        <p class="text-amber-700/70 mb-6">
          We're always looking for talented people who share our mission. Send us your resume and tell us how you'd contribute.
        </p>
        <a 
          href="mailto:careers@brightwire.news?subject=General Application" 
          class="inline-block bg-gradient-to-r from-amber-500 to-orange-500 text-white px-8 py-3 rounded-full font-semibold hover:shadow-lg hover:shadow-amber-500/25 transition-all"
        >
          Send Open Application
        </a>
      </div>
    </main>

    <Footer />
  </div>
</template>

<script setup>
useHead({
  title: 'Careers - BrightWire',
  meta: [
    { name: 'description', content: 'Join the BrightWire team and help us spread good news to the world. View open positions.' }
  ]
})
</script>
