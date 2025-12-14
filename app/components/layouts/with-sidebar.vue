<script setup lang="ts">
defineProps<{title: string, sidebarTitle: string}>();

const isMobileMenuOpen = ref(false);

onBeforeRouteLeave(() => {
  isMobileMenuOpen.value = false;
});
</script>

<template>
  <div class="flex min-h-svh w-full bg-gray-50">

    <!-- Mobile -->
    <header class="lg:hidden fixed top-0 left-0 right-0 z-30 lg:z-0 bg-white shadow-md p-4 flex items-center justify-start">
      <button
        class="p-1 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors mr-4"
        @click="isMobileMenuOpen = true"
      >
        <div class="i-carbon-menu text-2xl" />
      </button>
      <h1 class="text-xl font-bold text-gray-800 truncate">
        {{ title }}
      </h1>
    </header>

    <div
      class="fixed inset-y-0 left-0 w-full lg:w-64 z-30 lg:z-0 transform transition-transform duration-300 lg:relative lg:translate-x-0 lg:w-64 lg:shrink-0"
      :class="{
        'translate-x-0': isMobileMenuOpen, // Show on mobile
        '-translate-x-full': !isMobileMenuOpen, // Hide on mobile
      }"
    >
      <aside class="w-full py-6 bg-white border-r-2 border-gray-100 h-full ">

        <div class="flex items-center justify-between px-6 mb-8">
          <h3 class="text-xl font-bold text-gray-900 relative pb-2">
            {{ sidebarTitle }}
            <span class="absolute bottom-0 left-0 w-5 h-1 bg-indigo-600 rounded-full" />
          </h3>

          <div class="lg:hidden flex justify-end">
            <button class="text-slate-600 hover:text-gray-800" @click="isMobileMenuOpen = false">
              <div class="i-carbon-close text-2xl" />
            </button>
          </div>
        </div>

        <slot name="sidebar" />
      </aside>
    </div>

    <div class="flex-grow bg-white pt-16 lg:pt-0 pb-8">
      <main class="max-w-4xl mx-auto w-full p-4 lg:p-6">
        <div class="hidden lg:block">
          <h1 class="text-xl font-bold text-gray-900 relative pb-2 mb-6">
            {{ title }}
            <span class="absolute bottom-0 left-0 w-5 h-1 bg-indigo-600 rounded-full" />
          </h1>
        </div>

        <slot />
      </main>
    </div>
  </div>
</template>

<style scoped>
/* You can define transitions outside of UnoCSS if needed for complex effects */
.fade-slide-enter-active,
.fade-slide-leave-active {
  transition: opacity 0.3s;
}

.fade-slide-enter-from,
.fade-slide-leave-to {
  opacity: 0;
}
</style>
