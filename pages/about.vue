<template>
  <div>
    <Header />
    
    <main class="max-w-4xl mx-auto px-4 sm:px-6 py-12 sm:py-16">
      <!-- Hero -->
      <div class="text-center mb-12">
        <span class="text-6xl mb-4 block">☀️</span>
        <h1 class="text-4xl sm:text-5xl font-bold text-amber-950 font-display mb-4">
          About BrightWire
        </h1>
        <p class="text-xl text-amber-700/70">
          Good news exists. We find it.
        </p>
      </div>

      <!-- Content -->
      <div class="prose prose-lg prose-amber max-w-none">
        <div class="bg-white rounded-2xl p-8 sm:p-10 shadow-lg mb-8">
          <h2 class="text-2xl font-bold text-amber-950 font-display mb-4">Our Mission</h2>
          <p class="text-amber-800/80 leading-relaxed mb-4">
            BrightWire was founded on a simple belief: the news doesn't have to ruin your day. While traditional media focuses on conflict, disaster, and division, we believe there's another story being told — one of progress, kindness, and human triumph.
          </p>
          <p class="text-amber-800/80 leading-relaxed">
            Every day, remarkable things happen. Scientists make breakthroughs. Communities come together. Strangers help strangers. The planet heals in unexpected ways. These stories deserve attention too.
          </p>
        </div>

        <div class="bg-white rounded-2xl p-8 sm:p-10 shadow-lg mb-8">
          <h2 class="text-2xl font-bold text-amber-950 font-display mb-4">What We Do</h2>
          <p class="text-amber-800/80 leading-relaxed mb-4">
            We scan hundreds of news sources daily, using advanced AI to identify genuinely positive stories — not fluff, but real news about real progress. Then our editorial team rewrites each story in our signature warm, accessible style.
          </p>
          <p class="text-amber-800/80 leading-relaxed">
            The result? A news experience that leaves you informed AND hopeful. No doom-scrolling. No anxiety spirals. Just the good stuff.
          </p>
        </div>

        <div class="bg-white rounded-2xl p-8 sm:p-10 shadow-lg mb-8">
          <h2 class="text-2xl font-bold text-amber-950 font-display mb-4">Our Categories</h2>
          <div class="grid sm:grid-cols-2 gap-4">
            <div class="flex items-start gap-3">
              <span class="text-2xl">💡</span>
              <div>
                <h3 class="font-bold text-amber-900">Solutions</h3>
                <p class="text-amber-700/70 text-sm">Problems being solved, policies that work</p>
              </div>
            </div>
            <div class="flex items-start gap-3">
              <span class="text-2xl">🦸</span>
              <div>
                <h3 class="font-bold text-amber-900">Community Heroes</h3>
                <p class="text-amber-700/70 text-sm">People making a difference</p>
              </div>
            </div>
            <div class="flex items-start gap-3">
              <span class="text-2xl">🌍</span>
              <div>
                <h3 class="font-bold text-amber-900">Planet Wins</h3>
                <p class="text-amber-700/70 text-sm">Environmental victories and conservation</p>
              </div>
            </div>
            <div class="flex items-start gap-3">
              <span class="text-2xl">🚀</span>
              <div>
                <h3 class="font-bold text-amber-900">Innovation</h3>
                <p class="text-amber-700/70 text-sm">Science, tech, and medical breakthroughs</p>
              </div>
            </div>
            <div class="flex items-start gap-3">
              <span class="text-2xl">☀️</span>
              <div>
                <h3 class="font-bold text-amber-900">Daily Mix</h3>
                <p class="text-amber-700/70 text-sm">Feel-good stories and uplifting moments</p>
              </div>
            </div>
            <div class="flex items-start gap-3">
              <span class="text-2xl">💛</span>
              <div>
                <h3 class="font-bold text-amber-900">Acts of Kindness</h3>
                <p class="text-amber-700/70 text-sm">Heartwarming human moments</p>
              </div>
            </div>
          </div>
        </div>

        <div class="bg-gradient-to-r from-amber-500 to-orange-500 rounded-2xl p-8 sm:p-10 text-white text-center">
          <h2 class="text-2xl font-bold font-display mb-4">Join the Movement</h2>
          <p class="mb-6 text-white/90">
            50,000+ people start their day with BrightWire. Join them.
          </p>
          <NuxtLink to="/" class="inline-block bg-white text-amber-600 px-8 py-3 rounded-full font-semibold hover:bg-amber-50 transition-colors">
            Read Daily Mix
          </NuxtLink>
        </div>
      </div>
    </main>

    <Footer />
  </div>
</template>

<script setup>
useHead({
  title: 'About Us - BrightWire',
  meta: [
    { name: 'description', content: 'BrightWire curates positive news from around the world. Learn about our mission to spread good news.' }
  ]
})
</script>
