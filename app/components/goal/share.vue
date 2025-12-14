<script setup lang="ts">
const props = defineProps<{
  isOpen: boolean
  goalLink: string // Prop for the actual link to the goal post
}>();

const emit = defineEmits(['close']);

function copyLink() {
  navigator.clipboard.writeText(props.goalLink);
  emit('close'); // Close after copying
}

function closePopup() {
  emit('close');
}

const currentUrl = props.goalLink;
</script>

<template>
  <div
    v-if="isOpen"
    class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60]"
    @click.self="closePopup"
  >
    <div class="bg-white rounded-lg shadow-xl max-w-xl m-4 p-10 relative">
      <h3 class="text-xl text-center font-bold mb-10">
        Share
      </h3>
      <button
        class="absolute top-3 right-3 text-gray-600 text-2xl hover:text-gray-900"
        @click="closePopup"
      >
        &times;
      </button>

      <div class="grid grid-cols-5 gap-6">
        <button
          class="flex flex-col items-center flex-shrink-0 w-16"
          @click="copyLink"
        >
          <div class="w-12 h-12 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 transition-colors">
            <span class="i-mdi-content-copy text-2xl text-gray-700" />
          </div>
          <span class="text-xs mt-1 text-gray-700">Copy Link</span>
        </button>

        <template v-for="network in ['telegram', 'linkedin', 'threads', 'line', 'facebook', 'x', 'whatsapp']" :key="network">
          <SocialShare
            :network="network"
            :url="currentUrl"
            :label="false"
            @click="closePopup"
          >
            <template #icon>
              <button class="flex flex-col items-center flex-shrink-0 w-16">
                <div class="w-12 h-12 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 transition-colors">
                  <span :class="`i-fa7-brands:${network === 'x' ? 'x-twitter' : network} text-2xl text-gray-700`" />
                </div>
                <span class="text-xs mt-1 text-gray-700">{{ network }}</span>
              </button>
            </template>
          </SocialShare>
        </template>
      </div>
    </div>
  </div>
</template>
