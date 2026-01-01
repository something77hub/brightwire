<template>
  <div class="flex items-center gap-2 text-sm font-medium text-amber-900/80 bg-amber-50/50 px-3 py-1.5 rounded-full border border-amber-100/50 backdrop-blur-sm" v-if="weather">
    <span class="text-lg leading-none" :title="weather.condition">{{ weather.icon }}</span>
    <span class="hidden sm:inline">{{ weather.temp }}°{{ unit }}</span>
    <span class="hidden md:inline text-amber-900/60 ml-1 text-xs">{{ weather.city }}</span>
  </div>
  <div v-else-if="loading" class="w-20 h-8 bg-amber-50/50 rounded-full animate-pulse"></div>
</template>

<script setup lang="ts">
const props = defineProps<{
  defaultCity?: string
}>()

const loading = ref(true)
const weather = ref<{ temp: number; icon: string; condition: string; city: string } | null>(null)
const unit = ref('C')

// WMO Weather interpretation codes (https://open-meteo.com/en/docs)
function getWeatherIcon(code: number): string {
  if (code === 0) return '☀️' // Clear sky
  if (code === 1 || code === 2 || code === 3) return '⛅' // Partly cloudy
  if (code === 45 || code === 48) return '🌫️' // Fog
  if (code >= 51 && code <= 55) return '🌦️' // Drizzle
  if (code >= 61 && code <= 67) return '🌧️' // Rain
  if (code >= 71 && code <= 77) return '🌨️' // Snow
  if (code >= 80 && code <= 82) return 'Rain'
  if (code >= 95) return '⛈️' // Thunderstorm
  return '🌡️'
}

onMounted(() => {
  getUserLocation()
})

function getUserLocation() {
  // Use IP-based location to avoid permission prompts
  fetch('https://ipapi.co/json/')
    .then(res => res.json())
    .then(data => {
      if (data.latitude && data.longitude) {
        fetchWeather(data.latitude, data.longitude, data.city)
      } else {
        throw new Error('No location data')
      }
    })
    .catch(error => {
      console.warn('IP location failed, using fallback', error)
      fetchWeather(40.7128, -74.0060, 'New York')
    })
}

async function fetchWeather(lat: number, lon: number, cityName?: string) {
  try {
    loading.value = true
    
    // Reverse geocode if city not provided (optional, skipping complexity for now or using simple approximation could be good, but OpenMeteo doesn't give city names easily without another API. We'll simplify or use timezone/user approximation)
    let cityDisplay = cityName || 'Local'

    const response = await fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true&temperature_unit=celsius`
    )
    const data = await response.json()
    
    if (data.current_weather) {
      weather.value = {
        temp: Math.round(data.current_weather.temperature),
        icon: getWeatherIcon(data.current_weather.weathercode),
        condition: 'Current Weather',
        city: cityDisplay 
      }
    }
  } catch (e) {
    console.error('Failed to fetch weather', e)
  } finally {
    loading.value = false
  }
}
</script>
