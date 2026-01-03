<template>
  <footer class="relative z-10 bg-amber-950 text-amber-100 mt-20">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 py-12 sm:py-16">
      <div class="grid sm:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-8">
        <!-- Brand -->
        <div class="sm:col-span-2 lg:col-span-1">
          <div class="flex items-center gap-3 mb-4">
            <div class="w-10 h-10 bg-gradient-to-br from-amber-400 to-orange-400 rounded-xl flex items-center justify-center shadow-lg">
              <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            </div>
            <span class="text-xl font-bold text-white font-display">BrightWire</span>
          </div>
          <p class="text-amber-300/70 max-w-xs leading-relaxed">
            We believe in the power of positive journalism. Every day, we curate stories that inspire, uplift, and remind us of humanity's best.
          </p>
          
          <!-- Social Links -->
          <div class="flex items-center gap-3 mt-6">
            <!-- Twitter/X -->
            <a 
              v-if="settings?.socialTwitter"
              :href="settings.socialTwitter"
              target="_blank"
              rel="noopener noreferrer"
              class="w-10 h-10 bg-amber-900/50 hover:bg-amber-800 rounded-lg flex items-center justify-center text-amber-300/70 hover:text-white transition-all"
              aria-label="Twitter"
            >
              <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
              </svg>
            </a>
            
            <!-- Instagram -->
            <a 
              v-if="settings?.socialInstagram"
              :href="settings.socialInstagram"
              target="_blank"
              rel="noopener noreferrer"
              class="w-10 h-10 bg-amber-900/50 hover:bg-amber-800 rounded-lg flex items-center justify-center text-amber-300/70 hover:text-white transition-all"
              aria-label="Instagram"
            >
              <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
              </svg>
            </a>
            
            <!-- Facebook -->
            <a 
              v-if="settings?.socialFacebook"
              :href="settings.socialFacebook"
              target="_blank"
              rel="noopener noreferrer"
              class="w-10 h-10 bg-amber-900/50 hover:bg-amber-800 rounded-lg flex items-center justify-center text-amber-300/70 hover:text-white transition-all"
              aria-label="Facebook"
            >
              <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
              </svg>
            </a>
            
            <!-- LinkedIn -->
            <a 
              v-if="settings?.socialLinkedin"
              :href="settings.socialLinkedin"
              target="_blank"
              rel="noopener noreferrer"
              class="w-10 h-10 bg-amber-900/50 hover:bg-amber-800 rounded-lg flex items-center justify-center text-amber-300/70 hover:text-white transition-all"
              aria-label="LinkedIn"
            >
              <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
              </svg>
            </a>
            
            <!-- YouTube -->
            <a 
              v-if="settings?.socialYoutube"
              :href="settings.socialYoutube"
              target="_blank"
              rel="noopener noreferrer"
              class="w-10 h-10 bg-amber-900/50 hover:bg-amber-800 rounded-lg flex items-center justify-center text-amber-300/70 hover:text-white transition-all"
              aria-label="YouTube"
            >
              <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897.266-4.356 2.62-4.385 8.816.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0 3.897-.266 4.356-2.62 4.385-8.816-.029-6.185-.484-8.549-4.385-8.816zm-10.615 12.816v-8l8 3.993-8 4.007z"/>
              </svg>
            </a>
            
            <!-- TikTok -->
            <a 
              v-if="settings?.socialTiktok"
              :href="settings.socialTiktok"
              target="_blank"
              rel="noopener noreferrer"
              class="w-10 h-10 bg-amber-900/50 hover:bg-amber-800 rounded-lg flex items-center justify-center text-amber-300/70 hover:text-white transition-all"
              aria-label="TikTok"
            >
              <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/>
              </svg>
            </a>
            
            <!-- RSS Feed (always shown) -->
            <a 
              href="/feed.xml"
              target="_blank"
              rel="noopener noreferrer"
              class="w-10 h-10 bg-amber-900/50 hover:bg-amber-800 rounded-lg flex items-center justify-center text-amber-300/70 hover:text-white transition-all"
              aria-label="RSS Feed"
            >
              <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M6.18 15.64a2.18 2.18 0 0 1 2.18 2.18C8.36 19 7.38 20 6.18 20C5 20 4 19 4 17.82a2.18 2.18 0 0 1 2.18-2.18M4 4.44A15.56 15.56 0 0 1 19.56 20h-2.83A12.73 12.73 0 0 0 4 7.27V4.44m0 5.66a9.9 9.9 0 0 1 9.9 9.9h-2.83A7.07 7.07 0 0 0 4 12.93V10.1Z"/>
              </svg>
            </a>
          </div>
        </div>

        <!-- Sections -->
        <div>
          <h4 class="font-semibold text-white mb-4 text-sm uppercase tracking-wider">Sections</h4>
          <ul class="space-y-3 text-amber-300/70">
            <li v-for="link in sectionLinks" :key="link.href">
              <NuxtLink :to="link.href" class="hover:text-white transition-colors">
                {{ link.label }}
              </NuxtLink>
            </li>
          </ul>
        </div>

        <!-- Company -->
        <div>
          <h4 class="font-semibold text-white mb-4 text-sm uppercase tracking-wider">Company</h4>
          <ul class="space-y-3 text-amber-300/70">
            <li v-for="link in companyLinks" :key="link.href">
              <NuxtLink :to="link.href" class="hover:text-white transition-colors">
                {{ link.label }}
              </NuxtLink>
            </li>
            <li>
              <button 
                @click="scrollToNewsletter"
                class="hover:text-white transition-colors text-left"
              >
                Subscribe to Newsletter
              </button>
            </li>
          </ul>
        </div>

        <!-- Legal -->
        <div>
          <h4 class="font-semibold text-white mb-4 text-sm uppercase tracking-wider">Legal</h4>
          <ul class="space-y-3 text-amber-300/70">
            <li v-for="link in legalLinks" :key="link.href">
              <NuxtLink :to="link.href" class="hover:text-white transition-colors">
                {{ link.label }}
              </NuxtLink>
            </li>
          </ul>
        </div>
      </div>

      <!-- Bottom bar -->
      <div class="border-t border-amber-800/50 mt-10 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
        <p class="text-amber-400/60 text-sm text-center sm:text-left">
          © {{ new Date().getFullYear() }} BrightWire. Spreading good vibes worldwide.
        </p>
        <p class="text-amber-400/40 text-xs">
          Made with ☀️ for a brighter world
        </p>
      </div>
    </div>
  </footer>
</template>

<script setup lang="ts">
// Fetch site settings for social links
const { data: settings } = await useFetch('/api/site-settings')

const sectionLinks = [
  { label: "Daily Mix", href: '/category/good-news' },
  { label: 'Community Heroes', href: '/category/heroes' },
  { label: 'Planet Wins', href: '/category/planet' },
  { label: 'Innovation', href: '/category/innovation' },
  { label: 'Solutions', href: '/category/solutions' },
  { label: 'Acts of Kindness', href: '/category/kindness' },
  { label: 'Sports & Athletics', href: '/category/sports' },
  { label: 'Global News', href: '/category/world' },
]

const companyLinks = [
  { label: 'About Us', href: '/about' },
  { label: 'Submit a Story', href: '/submit' },
  { label: 'Advertise', href: '/advertise' },
  { label: 'Contact', href: '/contact' },
  { label: 'Careers', href: '/careers' },
]

const legalLinks = [
  { label: 'Privacy Policy', href: '/privacy' },
  { label: 'Terms of Service', href: '/terms' },
  { label: 'Cookie Policy', href: '/cookies' },
]

// Scroll to newsletter section and focus email input
function scrollToNewsletter() {
  const newsletter = document.getElementById('newsletter')
  if (newsletter) {
    newsletter.scrollIntoView({ behavior: 'smooth', block: 'center' })
    // Focus the email input after scroll animation
    setTimeout(() => {
      const emailInput = newsletter.querySelector('input[type="email"]') as HTMLInputElement
      if (emailInput) {
        emailInput.focus()
      }
    }, 500)
  } else {
    // Navigate to home page with newsletter hash
    navigateTo('/#newsletter')
  }
}
</script>
