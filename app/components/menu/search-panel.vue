<script setup lang="ts">
import { ref } from 'vue';
import { useApiUsers, type IUsers } from '~/composables/api/users';

import { watchDebounced } from '@vueuse/core';

const showSidebar = defineModel('show-sidebar', {
  type: Boolean,
  default: false,
});

interface IUser {
  id: number
  avatar: string
  name: string
  username: string
}

const users = ref<IUsers>();

const search = ref('');
const apiUsers = useApiUsers();

watchDebounced(
  search,
  () => { fetchUsers(); },
  { debounce: 500, maxWait: 1000 },
);

const isLoading = ref(false);
const fetchUsers = async () => {
  isLoading.value = true;
  try {
    const response = await apiUsers.retrieveAll({
      username: search.value,
    });
    users.value = response;
  } finally {
    isLoading.value = false;
  }
};
</script>

<template>
  <div class="min-h-svh bg-white relative overflow-hidden">
    <transition name="slide-left">
      <aside
        v-if="showSidebar"
        class="fixed top-0 left-0 w-sm max-w-[80vw] h-full shadow-xl bg-white border-r border-slate-200 z-15 flex flex-col lg:ml-64"
      >
        <div class="flex items-center justify-between p-4">
          <base-input v-model="search" type="text" placeholder="Search..." autofocus class="w-full" />
        </div>

        <div v-if="isLoading" class="text-center p-4">
          <base-loader type="classic" sample="2">Loading...</base-loader>
        </div>

        <div v-else class="flex-1 overflow-y-auto p-4">
          <div v-if="users?.data.length === 0" class="text-center">
            User not found
          </div>
          <nuxt-link
            v-for="user in users?.data"
            :key="user._id"
            :to="`/@${user.username}`"
            class="flex items-center gap-3 p-2 hover:bg-slate-50 rounded-lg transition cursor-pointer"
            @click="() => showSidebar = false"
          >
            <avatar :size="40" :user="user" />
            <div class="flex-1 text-sm flex flex-col">
              <span class="font-semibold">{{ user.username }}</span>
              <span class="">{{ user.profile?.status }}</span>
            </div>
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
