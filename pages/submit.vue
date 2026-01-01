<template>
  <div>
    <Header />
    
    <main class="max-w-4xl mx-auto px-4 sm:px-6 py-12 sm:py-16">
      <!-- Hero -->
      <div class="text-center mb-12">
        <span class="text-6xl mb-4 block">📝</span>
        <h1 class="text-4xl sm:text-5xl font-bold text-amber-950 font-display mb-4">
          Submit a Story
        </h1>
        <p class="text-xl text-amber-700/70">
          Know some good news? We want to hear it.
        </p>
      </div>

      <!-- Form -->
      <div class="bg-white rounded-2xl p-8 sm:p-10 shadow-lg mb-8">
        <form @submit.prevent="submitStory" class="space-y-6">
          <div>
            <label for="name" class="block text-sm font-semibold text-amber-900 mb-2">Your Name</label>
            <input 
              type="text" 
              id="name" 
              v-model="form.name"
              required
              class="w-full px-4 py-3 border border-amber-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
              placeholder="Jane Smith"
            />
          </div>

          <div>
            <label for="email" class="block text-sm font-semibold text-amber-900 mb-2">Email Address</label>
            <input 
              type="email" 
              id="email" 
              v-model="form.email"
              required
              class="w-full px-4 py-3 border border-amber-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
              placeholder="jane@example.com"
            />
          </div>

          <div>
            <label for="headline" class="block text-sm font-semibold text-amber-900 mb-2">Story Headline</label>
            <input 
              type="text" 
              id="headline" 
              v-model="form.headline"
              required
              class="w-full px-4 py-3 border border-amber-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
              placeholder="What's the good news?"
            />
          </div>

          <div>
            <label for="url" class="block text-sm font-semibold text-amber-900 mb-2">Source URL (optional)</label>
            <input 
              type="url" 
              id="url" 
              v-model="form.url"
              class="w-full px-4 py-3 border border-amber-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
              placeholder="https://..."
            />
          </div>

          <div>
            <label for="category" class="block text-sm font-semibold text-amber-900 mb-2">Category</label>
            <select 
              id="category" 
              v-model="form.category"
              required
              class="w-full px-4 py-3 border border-amber-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent bg-white"
            >
              <option value="">Select a category</option>
              <option value="solutions">💡 Solutions</option>
              <option value="heroes">🦸 Community Heroes</option>
              <option value="planet">🌍 Planet Wins</option>
              <option value="innovation">🚀 Innovation</option>
              <option value="kindness">💛 Acts of Kindness</option>
              <option value="good-news">☀️ Today's Good News</option>
            </select>
          </div>

          <div>
            <label for="details" class="block text-sm font-semibold text-amber-900 mb-2">Tell Us More</label>
            <textarea 
              id="details" 
              v-model="form.details"
              required
              rows="5"
              class="w-full px-4 py-3 border border-amber-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent resize-none"
              placeholder="What makes this story special? Why should people know about it?"
            ></textarea>
          </div>

          <button 
            type="submit"
            :disabled="submitting"
            class="w-full bg-gradient-to-r from-amber-500 to-orange-500 text-white py-4 rounded-xl font-semibold hover:shadow-lg hover:shadow-amber-500/25 transition-all disabled:opacity-50"
          >
            {{ submitting ? 'Submitting...' : 'Submit Story' }}
          </button>
        </form>

        <!-- Success message -->
        <div v-if="submitted" class="mt-6 p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-center">
          <span class="text-2xl block mb-2">🎉</span>
          <p class="font-semibold">Thank you for your submission!</p>
          <p class="text-sm text-emerald-600">We'll review your story and get back to you if we decide to feature it.</p>
        </div>

        <!-- Error message -->
        <div v-if="error" class="mt-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-800 text-center">
          <span class="text-2xl block mb-2">😕</span>
          <p class="font-semibold">{{ error }}</p>
        </div>
      </div>

      <!-- Guidelines -->
      <div class="bg-amber-50 rounded-2xl p-8 sm:p-10">
        <h2 class="text-xl font-bold text-amber-900 mb-4">Submission Guidelines</h2>
        <ul class="space-y-3 text-amber-800/80">
          <li class="flex items-start gap-3">
            <span class="text-emerald-500 mt-1">✓</span>
            <span>Stories should be genuinely positive — solutions, progress, kindness, breakthroughs</span>
          </li>
          <li class="flex items-start gap-3">
            <span class="text-emerald-500 mt-1">✓</span>
            <span>Include verifiable sources when possible</span>
          </li>
          <li class="flex items-start gap-3">
            <span class="text-emerald-500 mt-1">✓</span>
            <span>Recent news preferred (within the last month)</span>
          </li>
          <li class="flex items-start gap-3">
            <span class="text-rose-500 mt-1">✗</span>
            <span>No promotional content or press releases</span>
          </li>
          <li class="flex items-start gap-3">
            <span class="text-rose-500 mt-1">✗</span>
            <span>No political endorsements or campaign news</span>
          </li>
        </ul>
      </div>
    </main>

    <Footer />
  </div>
</template>

<script setup>
const form = reactive({
  name: '',
  email: '',
  headline: '',
  url: '',
  category: '',
  details: ''
})

const submitting = ref(false)
const submitted = ref(false)
const error = ref('')

async function submitStory() {
  submitting.value = true
  error.value = ''
  
  try {
    // Submit to our API (uses Resend)
    await $fetch('/api/submit-story', {
      method: 'POST',
      body: {
        name: form.name,
        email: form.email,
        storyUrl: form.url,
        source: form.headline,
        description: `Category: ${form.category}\n\n${form.details}`,
      }
    })
    
    submitted.value = true
    // Reset form
    form.name = ''
    form.email = ''
    form.headline = ''
    form.url = ''
    form.category = ''
    form.details = ''
  } catch (err) {
    error.value = err.data?.message || 'Failed to submit story. Please try again.'
  } finally {
    submitting.value = false
  }
}

useHead({
  title: 'Submit a Story - BrightWire',
  meta: [
    { name: 'description', content: 'Know some good news? Submit your story to BrightWire and help spread positivity.' }
  ]
})
</script>
