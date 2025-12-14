<script setup lang="ts">
const showSidebar = defineModel('show-sidebar', {
  type: Boolean,
  default: false,
});
</script>

<template>
  <div class="min-h-svh bg-white relative overflow-hidden">
    <!-- Notification Sidebar -->
    <transition name="slide-left">
      <aside
        v-if="showSidebar"
        class="fixed top-0 left-0 w-sm max-w-[80vw] h-full shadow-xl bg-white border-r border-slate-200 z-15 flex flex-col lg:ml-64"
      >
        <div class="flex flex-col gap-8 justify-center items-center p-8">
          <nuxt-link to="/goals/create" class="w-full p-8 rounded-xl flex flex-col items-center justify-center text-center bg-green-500 text-white hover:shadow-lg transform transition-all duration-300 ease-in-out" @click="showSidebar = false">
            <div class="i-mingcute:target-fill text-5xl mb-1" />
            <span class="font-bold uppercase text-xl">Create Goal</span>
            <span class="text-sm font-normal opacity-80 mt-1">Let's make a plan.</span>
          </nuxt-link>

          <nuxt-link to="/progress/create" class="w-full p-8 rounded-xl flex flex-col items-center justify-center text-center bg-blue-400 text-white hover:shadow-lg transform transition-all duration-300 ease-in-out" @click="showSidebar = false">
            <div class="i-solar:camera-bold text-5xl mb-1" />
            <span class="font-bold uppercase text-xl">Update Progress</span>
            <span class="text-sm font-normal opacity-80 mt-1">Share your progress now!</span>
          </nuxt-link>
        </div>
      </aside>
    </transition>

    <!-- Overlay -->
    <div
      v-if="showSidebar"
      class="fixed inset-0 bg-black/30 backdrop-blur-sm z-10"
      @click="showSidebar = false"
    />
  </div>
</template>

<style scoped>
.slide-left-enter-active,
.slide-left-leave-active {
  transition: transform 0.3s ease, opacity 0.3s ease;
}

.slide-left-enter-from,
.slide-left-leave-to {
  transform: translateX(-100%);
  opacity: 0;
}
</style>

<!--
Notes:
- Sidebar slides in from the left like Instagram/TikTok notifications panel.
- Click the heart icon in the top bar to open it.
- Uses UnoCSS classes only, no classic CSS except for transition definition.
- Place under `pages/notifications.vue` or integrate in your layout.
-->
