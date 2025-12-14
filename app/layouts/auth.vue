<script setup>
import { toastRef } from '~/composables/toast';
</script>

<template>
  <div class="min-h-svh bg-gradient-to-br from-purple-300 via-pink-300 to-yellow-200 flex flex-col items-center justify-center p-4">
    <slot />
    <div class="mt-4 text-center text-gray-700">
      <nuxt-link to="/" class="text-slate-500 hover:text-slate-600 transition-colors">
        Home
      </nuxt-link> .
      <nuxt-link to="/about" class="text-slate-500 hover:text-slate-600 transition-colors">
        About
      </nuxt-link> .
      <nuxt-link to="/privacy" class="text-slate-500 hover:text-slate-600 transition-colors">
        Privacy
      </nuxt-link> .
      <nuxt-link to="/terms" class="text-slate-500 hover:text-slate-600 transition-colors">
        Terms
      </nuxt-link>
    </div>
  </div>
  <base-toast ref="toastRef" />
</template>
