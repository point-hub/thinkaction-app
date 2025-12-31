<script setup lang="ts">
import { ref, onMounted  } from 'vue';
import { useApiNotifications, type INotifications } from '~/composables/api/notifications';
import { useAblyChannel } from '~/composables/pub-sub';

const userId = useAuth().user.value?._id;
const { messages, subscribe } = useAblyChannel(`notifications:${userId}`);
const apiNotifications = useApiNotifications();

const showSidebar = defineModel('show-sidebar', {
  type: Boolean,
  default: false,
});

onMounted(async () => {
  await subscribe();
});

watch(
  () => messages.value.length,
  () => {
    notifications.value?.data.unshift(messages.value?.at(-1)?.data);
  },
);

watch(
  () => showSidebar.value,
  () => {
    if (showSidebar.value) {
      apiNotifications.updateRead();
    }
  },
);

const notifications = ref<INotifications>();

onMounted(async () => {
  const { user: authUser } = useAuth();

  notifications.value = await apiNotifications.retrieveAll({
    filter: {
      recipient_id: authUser.value?._id,
    },
    sort: '-created_at',
  });
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
        <!-- Header -->
        <div class="flex items-center justify-between p-4 border-b border-slate-100">
          <h2 class="text-lg font-semibold">Notifications</h2>
          <button class="i-lucide:x text-xl" @click="showSidebar = false" />
        </div>

        <!-- Body -->
        <div class="flex-1 overflow-y-auto p-3 gap-4">
          <template v-for="(notification, index) in notifications?.data" :key="index">
            <div v-if="notification" class="flex items-start gap-3 p-2 hover:bg-slate-50 transition" :class="{ 'bg-slate-100': !notification.is_read }">
              <avatar :size="32" :user="notification.actor" />

              <template v-if="notification.type === 'comment'">
                <nuxt-link :to="`/goals/${notification.entities?.goals}`" @click="showSidebar = false">
                  <div class="flex-1 text-sm">
                    <span class="font-semibold">{{ notification.actor?.username }}</span>
                    <span class="text-slate-600 pl-1">is commenting on your goal</span>
                    <div class="text-xs text-slate-400">{{ timeAgo(notification.created_at) }}</div>
                  </div>
                </nuxt-link>
              </template>
              <template v-else-if="notification.type === 'support'">
                <nuxt-link :to="`/@${notification.actor?.username}`" @click="showSidebar = false">
                  <div class="flex-1 text-sm">
                    <span class="font-semibold">{{ notification.actor?.username }}</span>
                    <span class="text-slate-600 pl-1">is supporting you</span>
                    <div class="text-xs text-slate-400">{{ timeAgo(notification.created_at) }}</div>
                  </div>
                </nuxt-link>
              </template>
              <template v-else-if="notification.type === 'unsupport'">
                <nuxt-link :to="`/@${notification.actor?.username}`" @click="showSidebar = false">
                  <div class="flex-1 text-sm">
                    <span class="font-semibold">{{ notification.actor?.username }}</span>
                    <span class="text-slate-600 pl-1">is unsupporting you</span>
                    <div class="text-xs text-slate-400">{{ timeAgo(notification.created_at) }}</div>
                  </div>
                </nuxt-link>
              </template>
              <template v-else-if="notification.type === 'goal-reminder'">
                <nuxt-link :to="`/goals/${notification.entities?.goals}`" @click="showSidebar = false">
                  <div class="flex-1 text-sm">
                    <span class="font-semibold">System</span>
                    <span class="text-slate-600 pl-1">You have 1 day left to wrap up your goal.</span>
                    <div class="text-xs text-slate-400">{{ timeAgo(notification.created_at) }}</div>
                  </div>
                </nuxt-link>
              </template>
            </div>
          </template>
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
