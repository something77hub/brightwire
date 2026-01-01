<template>
  <section class="mt-16 sm:mt-20">
    <div class="relative">
      <!-- Glow -->
      <div class="absolute inset-0 bg-gradient-to-r from-amber-400 via-orange-400 to-rose-400 rounded-3xl blur-xl opacity-30"></div>
      
      <!-- Card -->
      <div class="relative bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500 rounded-3xl p-8 sm:p-10 lg:p-12 text-center overflow-hidden">
        <!-- Decorative circles -->
        <div class="absolute top-0 left-0 w-32 sm:w-40 h-32 sm:h-40 bg-white/10 rounded-full -translate-x-1/2 -translate-y-1/2"></div>
        <div class="absolute bottom-0 right-0 w-48 sm:w-60 h-48 sm:h-60 bg-white/10 rounded-full translate-x-1/3 translate-y-1/3"></div>
        <div class="absolute top-1/2 left-1/4 w-20 h-20 bg-white/5 rounded-full"></div>

        <div class="relative z-10">
          <!-- Icon -->
          <span class="text-4xl sm:text-5xl mb-4 block animate-bounce">☀️</span>
          
          <!-- Heading -->
          <h3 class="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-3 font-display">
            {{ siteSettings?.newsletterTitle || 'Start Your Day With Good News' }}
          </h3>
          
          <!-- Subtext -->
          <p class="text-white/80 mb-6 sm:mb-8 max-w-md mx-auto text-base sm:text-lg">
            {{ siteSettings?.newsletterSubtitle || 'Join 50,000+ readers who wake up to stories that inspire. Delivered fresh every morning.' }}
          </p>

          <!-- Form -->
          <form @submit.prevent="subscribe" class="flex flex-col sm:flex-row gap-3 justify-center max-w-lg mx-auto">
            <input 
              v-model="email"
              type="email"
              required
              placeholder="Enter your email"
              class="flex-1 px-5 py-3.5 rounded-full text-amber-900 placeholder-amber-400 focus:outline-none focus:ring-4 focus:ring-white/30 text-center sm:text-left"
            />
            <button 
              type="submit"
              :disabled="loading"
              class="bg-amber-950 text-white px-8 py-3.5 rounded-full font-semibold hover:bg-amber-900 transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              <svg v-if="loading" class="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <span>{{ loading ? 'Subscribing...' : (siteSettings?.newsletterButtonText || 'Subscribe Free') }}</span>
            </button>
          </form>

          <!-- Success message -->
          <Transition
            enter-active-class="transition duration-300 ease-out"
            enter-from-class="opacity-0 translate-y-2"
            enter-to-class="opacity-100 translate-y-0"
          >
            <p v-if="subscribed" class="text-white mt-4 flex items-center justify-center gap-2">
              <svg class="w-5 h-5 text-emerald-300" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
              </svg>
              {{ successMsg }}
            </p>
          </Transition>

          <!-- Error message -->
          <Transition
            enter-active-class="transition duration-300 ease-out"
            enter-from-class="opacity-0 translate-y-2"
            enter-to-class="opacity-100 translate-y-0"
          >
            <p v-if="errorMsg" class="text-red-200 mt-4 flex items-center justify-center gap-2">
              <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
              </svg>
              {{ errorMsg }}
            </p>
          </Transition>

          <!-- Privacy note -->
          <p class="text-white/60 text-xs sm:text-sm mt-4">
            No spam, ever. Unsubscribe anytime.
          </p>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
const { siteSettings } = useSiteSettings()

const email = ref('')
const loading = ref(false)
const subscribed = ref(false)
const errorMsg = ref('')
const successMsg = ref('')

async function subscribe() {
  if (!email.value) return
  
  loading.value = true
  errorMsg.value = ''
  
  try {
    const response = await $fetch('/api/subscribe', {
      method: 'POST',
      body: { email: email.value },
    })
    
    successMsg.value = response.message || siteSettings.value?.newsletterSuccessMessage || "You're in! Check your inbox."
    subscribed.value = true
    email.value = ''
    
    // Reset after 5 seconds
    setTimeout(() => {
      subscribed.value = false
      successMsg.value = ''
    }, 5000)
  } catch (error: any) {
    errorMsg.value = error.data?.message || 'Something went wrong. Please try again.'
    setTimeout(() => {
      errorMsg.value = ''
    }, 5000)
  } finally {
    loading.value = false
  }
}
</script>
