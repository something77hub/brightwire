<template>
  <div class="relative group z-50">
    <!-- Main Widget Pill -->
    <div 
      class="flex items-center gap-2 text-sm font-medium text-amber-900/80 bg-amber-50/50 px-3 py-1.5 rounded-full border border-amber-100/50 backdrop-blur-sm transition-colors hover:bg-amber-100/60 cursor-help" 
      v-if="weather"
    >
      <span class="text-lg leading-none">{{ weather.icon }}</span>
      <span class="hidden sm:inline font-bold">{{ weather.temp }}°{{ unit }}</span>
      <span class="hidden lg:inline text-amber-900/60 ml-0.5 text-xs border-l border-amber-200 pl-2">{{ weather.condition }}</span>
      <span class="hidden md:inline text-amber-900/60 ml-1 text-xs max-w-[100px] truncate">{{ weather.city }}</span>
    </div>
    <div v-else-if="loading" class="w-20 h-8 bg-amber-50/50 rounded-full animate-pulse"></div>

    <!-- Hover Popover -->
    <Transition
      enter-active-class="transition duration-200 ease-out"
      enter-from-class="opacity-0 translate-y-2 scale-95"
      enter-to-class="opacity-100 translate-y-0 scale-100"
      leave-active-class="transition duration-150 ease-in"
      leave-from-class="opacity-100 translate-y-0 scale-100"
      leave-to-class="opacity-0 translate-y-2 scale-95"
    >
      <div 
        v-if="weather"
        class="absolute top-full left-0 mt-2 w-64 bg-white/90 backdrop-blur-xl rounded-2xl shadow-xl border border-amber-100 p-4 hidden group-hover:block"
      >
        <div class="flex items-start justify-between mb-3">
          <div>
            <p class="text-xs font-bold text-amber-500 uppercase tracking-wider mb-0.5">{{ weather.city }}</p>
            <p class="font-bold text-amber-900 text-lg leading-tight">{{ weather.condition }}</p>
          </div>
          <span class="text-3xl">{{ weather.icon }}</span>
        </div>
        
        <div class="flex items-baseline gap-1 mb-4">
          <span class="text-4xl font-bold text-amber-950">{{ weather.temp }}°</span>
          <div class="flex flex-col text-xs font-medium text-amber-700/80 ml-2">
            <span>H: {{ weather.high }}°</span>
            <span>L: {{ weather.low }}°</span>
          </div>
        </div>

        <div class="grid grid-cols-2 gap-2 pt-3 border-t border-amber-100/50">
          <div class="bg-amber-50/50 rounded-lg p-2 text-center">
            <span class="block text-[10px] text-amber-500 font-bold uppercase">Wind</span>
            <span class="text-sm font-medium text-amber-900">{{ weather.wind }} <span class="text-[10px]">km/h</span></span>
          </div>
          <div class="bg-amber-50/50 rounded-lg p-2 text-center">
             <span class="block text-[10px] text-amber-500 font-bold uppercase">Precip</span>
            <span class="text-sm font-medium text-amber-900">{{ weather.precip }}<span class="text-[10px]">%</span></span>
          </div>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{
  defaultCity?: string
}>()

const loading = ref(true)
const weather = ref<{ 
  temp: number; 
  high: number;
  low: number;
  icon: string; 
  condition: string; 
  city: string;
  wind: number;
  precip: number;
} | null>(null)
const unit = ref('C')

// WMO Weather interpretation
function getWeatherInfo(code: number): { icon: string, label: string } {
  if (code === 0) return { icon: '☀️', label: 'Clear Sky' }
  if (code === 1) return { icon: '🌤️', label: 'Mainly Clear' }
  if (code === 2) return { icon: '⛅', label: 'Partly Cloudy' }
  if (code === 3) return { icon: '☁️', label: 'Overcast' }
  if (code === 45 || code === 48) return { icon: '🌫️', label: 'Foggy' }
  if (code >= 51 && code <= 55) return { icon: '🌦️', label: 'Drizzle' }
  if (code >= 61 && code <= 67) return { icon: '🌧️', label: 'Rain' }
  if (code >= 71 && code <= 77) return { icon: '🌨️', label: 'Snow' }
  if (code >= 80 && code <= 82) return { icon: '🌦️', label: 'Showers' }
  if (code >= 95) return { icon: '⛈️', label: 'Thunderstorm' }
  return { icon: '🌡️', label: 'Unknown' }
}

onMounted(() => {
  getUserLocation()
})

function getUserLocation() {
  fetch('https://ipapi.co/json/')
    .then(res => res.json())
    .then(data => {
      if (data.latitude && data.longitude) {
        fetchWeather(data.latitude, data.longitude, data.city)
      } else {
        throw new Error('No location')
      }
    })
    .catch(err => {
      console.warn('Loc fail', err)
      fetchWeather(40.7128, -74.0060, 'New York')
    })
}

async function fetchWeather(lat: number, lon: number, cityName?: string) {
  try {
    loading.value = true
    const cityDisplay = cityName || 'Local'

    // Fetch current + daily highs/lows + wind + precip prob
    const response = await fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true&daily=temperature_2m_max,temperature_2m_min,precipitation_probability_max&temperature_unit=celsius&timezone=auto`
    )
    const data = await response.json()
    
    if (data.current_weather && data.daily) {
      const info = getWeatherInfo(data.current_weather.weathercode)
      
      weather.value = {
        temp: Math.round(data.current_weather.temperature),
        high: Math.round(data.daily.temperature_2m_max[0]),
        low: Math.round(data.daily.temperature_2m_min[0]),
        wind: Math.round(data.current_weather.windspeed),
        precip: data.daily.precipitation_probability_max?.[0] || 0,
        icon: info.icon,
        condition: info.label,
        city: cityDisplay 
      }
    }
  } catch (e) {
    console.error('Weather error', e)
  } finally {
    loading.value = false
  }
}
</script>
