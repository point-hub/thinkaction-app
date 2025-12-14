<script setup lang="ts">
import type { NuxtError } from '#app';

const props = defineProps({

  error: Object as () => NuxtError,
});

const statusCode = computed(() => props.error?.statusCode);
const handleError = () => clearError({ redirect: '/' });

// Define color and title based on status code
const errorMap: Record<number, { title: string; color: string; emoji: string }> = {
  401: { title: 'Unauthorized', color: 'text-orange-500 bg-orange-100', emoji: '🔑' },
  403: { title: 'Forbidden', color: 'text-red-500 bg-red-100', emoji: '🛑' },
  404: { title: 'Page Not Found', color: 'text-blue-500 bg-blue-100', emoji: '🧭' },
  500: { title: 'Server Error', color: 'text-purple-500 bg-purple-100', emoji: '🚧' },
};

const errorInfo = computed(() => errorMap[statusCode.value!] || {
  title: 'An Unexpected Error',
  color: 'text-gray-500 bg-gray-100',
  emoji: '❓',
});

// Determine the main background color for the section
const sectionColor = computed(() => {
  if (statusCode.value === 404) return 'bg-blue-400/20';
  if (statusCode.value! >= 500) return 'bg-red-400/20';
  return 'bg-gray-100';
});
</script>

<template>
  <div class="min-h-svh bg-gradient-to-br from-purple-300 via-pink-300 to-yellow-200 flex flex-col items-center justify-center p-4">
    <div class="w-full max-w-lg p-10 rounded-3xl shadow-2xl bg-white text-center transform transition-all duration-500 hover:shadow-3xl animate-pulse-slow">
      <div
        class="inline-flex items-center justify-center w-20 h-20 mb-6 rounded-full font-extrabold text-4xl"
        :class="errorInfo.color"
      >
        {{ errorInfo.emoji }}
      </div>

      <h1 class="text-7xl font-black mb-4" :class="errorInfo.color.split(' ')[0]">
        {{ statusCode }}
      </h1>

      <h2 class="text-3xl font-bold text-gray-800 mb-4">
        {{ errorInfo.title }}
      </h2>

      <p class="text-gray-600 mb-8 max-w-xs mx-auto">
        {{ error?.message || 'It looks like you found a broken link or something went wrong on our server.' }}
      </p>

      <button class="px-8 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-semibold rounded-lg text-lg shadow-lg transform transition-all duration-300 hover:scale-105 hover:shadow-xl" @click="handleError">
        Take Me Home!
      </button>

      <pre v-if="!statusCode" class="mt-4 text-xs text-left text-gray-500 bg-gray-50 p-3 rounded">
        {{ error }}
      </pre>

    </div>
  </div>
</template>

<style>
/* Custom Keyframe: Pulse/Wobble Slow
  (You'd define this in your UnoCSS config or global CSS)
*/
.animate-pulse-slow {
  animation: pulse-slow 6s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}

@keyframes pulse-slow {
  0%,
  100% {
    transform: scale(1);
  }

  50% {
    transform: scale(1.01);
  }
}
</style>
