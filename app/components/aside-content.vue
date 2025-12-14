<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from 'vue';

const asideContentRef = ref<HTMLElement | null>(null);

const scrollToBottom = () => {
  const el = asideContentRef.value;
  if (!el) return;
  el.scrollTop = el.scrollHeight;
};

let observer: MutationObserver | null = null;

onMounted(() => {
  const el = asideContentRef.value;
  if (!el) return;

  observer = new MutationObserver(() => {
    scrollToBottom();
  });

  observer.observe(el, {
    childList: true,
    subtree: true,
  });
});

onBeforeUnmount(() => {
  observer?.disconnect();
});

defineExpose({
  asideContentRef,
  scrollToBottom,
});
</script>

<template>
  <div class="flex flex-col justify-between items-center w-full h-full max-h-svh">
    <div ref="asideContentRef" class="flex-1 overflow-y-auto w-full py-6 px-4">
      <!-- Automatically scrolls when content changes -->
      <slot />
    </div>
    <div class="flex flex-col gap-2 py-6 px-4">
      <div class="flex flex-wrap space-x-2 gap-1 text-gray-500 text-sm justify-center">
        <nuxt-link to="/about">About</nuxt-link>
        <nuxt-link to="/privacy">Privacy</nuxt-link>
        <nuxt-link to="/terms">Terms</nuxt-link>
      </div>
      <div class="flex flex-wrap space-x-2 gap-1 text-gray-400 text-xs justify-center uppercase">
        @2025 Thinkaction
      </div>
    </div>
  </div>
</template>
