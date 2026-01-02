<!-- Custom Error Page -->
<template>
  <div class="min-h-screen flex items-center justify-center px-4 py-16 sm:px-6 sm:py-24 md:grid md:place-items-center lg:px-8">
    <div class="max-w-max mx-auto text-center">
      <!-- Error Illustration -->
      <div v-if="error.statusCode === 404" class="mb-8 relative w-64 h-64 mx-auto">
        <div class="absolute inset-0 bg-amber-100 rounded-full animate-pulse"></div>
        <img 
          src="https://media.giphy.com/media/l41lFw057lAJQMwg0/giphy.gif"
          alt="Searching travolta" 
          class="relative w-full h-full object-cover rounded-full border-4 border-white shadow-xl"
        />
        <div class="absolute -bottom-2 -right-2 bg-white p-2 rounded-full shadow-lg text-4xl">
          🤔
        </div>
      </div>

      <main class="sm:flex">
        <p class="text-4xl font-extrabold text-amber-600 sm:text-5xl">{{ error.statusCode }}</p>
        <div class="sm:ml-6">
          <div class="sm:border-l sm:border-gray-200 sm:pl-6">
            <h1 class="text-4xl font-extrabold text-gray-900 tracking-tight sm:text-5xl">
              {{ error.statusCode === 404 ? 'Page not found' : 'Oops, something went wrong' }}
            </h1>
            <p class="mt-4 text-base text-gray-500 max-w-lg mx-auto sm:mx-0">
              {{ error.statusCode === 404 
                ? "The positive story you're looking for seems to have moved or doesn't exist. Don't worry, there's plenty more good news."
                : "We hit a snag while trying to fetch the good news. Our positive vibes technician is looking into it."
              }}
            </p>
          </div>
          <div class="mt-10 flex space-x-3 sm:border-l sm:border-transparent sm:pl-6 justify-center sm:justify-start">
            <button 
              @click="handleError"
              class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-amber-600 hover:bg-amber-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500 transition-colors"
            >
              Go back home
            </button>
            <button 
              @click="$router.push('/category/good-news')"
              class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-amber-700 bg-amber-100 hover:bg-amber-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500 transition-colors"
            >
              Read Good News
            </button>
          </div>
        </div>
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { NuxtError } from '#app'

const props = defineProps<{
  error: NuxtError
}>()

const handleError = () => clearError({ redirect: '/' })
</script>
