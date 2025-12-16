<script setup lang="ts">
import { useApiGoals } from '~/composables/api/goals';

useHead({
  link: [
    { rel: 'canonical', href: 'https://thinkaction.id/' },
  ],
});

const { user: myUser } = useAuth();

const apiGoals = useApiGoals();
const route = useRoute();

const { data: goals } = await apiGoals.retrieveAllReactive({
  sort: '-created_at',
  filter: { _id: route.params.id },
});

function onGoalDeleted(id: string) {
  if (!goals.value?.data) return;
  goals.value.data = goals.value.data.filter(g => g._id !== id);
}

useSeoMeta({
  title: 'Thinkaction — Turn Ideas into Action',
  description: 'Join Thinkaction to share, track, and achieve your personal and community goals.',
  ogTitle: 'Thinkaction — Turn Ideas into Action',
  ogType: 'website',
  ogSiteName: 'Thinkaction',
  ogDescription: 'Join Thinkaction to share, track, and achieve your personal and community goals.',
  ogUrl: 'https://thinkaction.id/',
  ogImage: goals.value.data[0]?.thumbnail_url,
  twitterCard: 'summary_large_image',
  twitterImage: goals.value.data[0]?.thumbnail_url,
});
</script>

<template>
  <layouts-with-aside aside-title="">
    <div class="max-w-lg h-full mx-auto pb-20">
      <template v-if="goals?.data?.length">
        <div v-for="goal in goals?.data" :key="goal._id">
          <card-goal :goal="goal" @deleted="onGoalDeleted" />
        </div>
      </template>
      <template v-else>
        <div class="flex items-center h-full justify-center">
          <div class="flex flex-col items-center justify-center text-center p-10 rounded-2xl dark:bg-slate-900">
            <h2 class="text-2xl font-extrabold text-slate-900 dark:text-slate-100">
              NO GOALS FOUND
            </h2>
            <p class="mt-2 text-slate-500 dark:text-slate-300 max-w-[36rem]">
              There are no goals to display. Start creating your own goal to begin your journey!
            </p>
          </div>
        </div>
      </template>
    </div>

    <template #aside>
      <aside-content>
        <div v-if="myUser" class="flex justify-between w-full gap-2 lg:gap-3 mb-6 p-2">
          <div class="flex items-center gap-2">
            <my-avatar />
            <div>
              <p class="font-semibold">{{ myUser?.username }}</p>
              <p class="text-gray-500 text-xs">{{ myUser?.profile?.status }}</p>
            </div>
          </div>
        </div>
      </aside-content>
    </template>
  </layouts-with-aside>
</template>
