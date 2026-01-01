<template>
  <div class="min-h-screen bg-gradient-to-br from-amber-50 to-orange-50 flex items-center justify-center p-4">
    <div class="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md">
      <div class="text-center mb-8">
        <div class="w-16 h-16 bg-gradient-to-br from-amber-400 to-orange-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <svg class="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
          </svg>
        </div>
        <h1 class="text-2xl font-bold text-gray-900">BrightWire Admin</h1>
        <p class="text-gray-500 mt-2">Enter your admin password to continue</p>
      </div>

      <form @submit.prevent="login" class="space-y-6">
        <div>
          <label for="password" class="block text-sm font-medium text-gray-700 mb-1">
            Admin Password
          </label>
          <input
            v-model="password"
            type="password"
            id="password"
            required
            autofocus
            class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
            placeholder="Enter password"
          />
        </div>

        <div v-if="error" class="bg-red-50 text-red-600 px-4 py-3 rounded-lg text-sm">
          {{ error }}
        </div>

        <button
          type="submit"
          :disabled="loading"
          class="w-full bg-gradient-to-r from-amber-500 to-orange-500 text-white py-3 rounded-lg font-semibold hover:from-amber-600 hover:to-orange-600 disabled:opacity-50 flex items-center justify-center gap-2"
        >
          <svg v-if="loading" class="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          {{ loading ? 'Signing in...' : 'Sign In' }}
        </button>
      </form>

      <div class="mt-6 text-center">
        <NuxtLink to="/" class="text-amber-600 hover:text-amber-700 text-sm">
          ← Back to BrightWire
        </NuxtLink>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  layout: false,
})

const password = ref('')
const loading = ref(false)
const error = ref('')
const router = useRouter()

async function login() {
  loading.value = true
  error.value = ''

  try {
    const res = await $fetch('/api/admin/login', {
      method: 'POST',
      body: { password: password.value },
    })

    if (res.success) {
      // Cookie is set by server, redirect to admin
      router.push('/admin')
    }
  } catch (e: any) {
    error.value = e.data?.message || 'Invalid password'
  } finally {
    loading.value = false
  }
}

useHead({
  title: 'Admin Login - BrightWire',
})
</script>
