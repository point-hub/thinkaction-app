<script setup lang="ts">
import { ref } from 'vue';
import { useApiGoals } from '~/composables/api/goals';

const asideMounted = ref(false);
const { user: myUser } = useAuth();
const apiGoals = useApiGoals();

const isWithin7Days = (createdAt: string | Date) => {
  const created = new Date(createdAt);
  const now = new Date();

  const diffInDays = (now.getTime() - created.getTime()) / (1000 * 60 * 60 * 24);

  return diffInDays <= 7;
};

const { data: goals } = await apiGoals.retrieveAllReactive({
  sort: '-created_at',
  filter: {
    created_by_id: myUser.value?._id,
    status: 'in-progress',
  },
});

onMounted(() => {
  if (!myUser.value) {
    navigateTo('/signin');
  }
});
</script>

<template>
  <layouts-with-aside v-model:aside-mounted="asideMounted" aside-title="">
    <div class="max-w-lg mx-auto lg:p-8">
      <div class="p-4 bg-white flex flex-col gap-4 border border-gray-200 shadow-lg lg:rounded-xl">
        <div class="flex items-center gap-2">
          <my-avatar />
          <div>
            <p class="font-semibold">{{ myUser?.username }}</p>
            <p class="text-gray-500 text-xs">{{ myUser?.profile?.status }}</p>
          </div>
        </div>

        <div v-if="goals.pagination.total_document > 0" class="flex flex-col gap-4">
          Which goal do you want to add progress to?
          <template v-for="goal in goals.data" :key="goal._id">
            <nuxt-link v-if="goal.created_at && isWithin7Days(goal.created_at)" :to="`/progress/create-thumbnail?goal_id=${goal._id}`" class="p-2 flex flex-col border border-slate-300">
              <span class="font-semibold text-xs text-gray-400">Next week, I want to</span>
              <span>{{ goal.specific }}</span>
            </nuxt-link>
          </template>
        </div>
        <template v-else>
          <div class="flex items-center h-full justify-center">
            <div class="flex flex-col items-center justify-center text-center p-10 rounded-2xl dark:bg-slate-900">
              <h2 class="text-xl font-extrabold text-slate-900 dark:text-slate-100">
                NO GOALS FOUND
              </h2>
              <p class="mt-2 text-slate-500 dark:text-slate-300 max-w-[36rem]">
                There are no goals to add progress. Start creating your own goal.
              </p>
              <br>
              <nuxt-link to="/goals/create" class="w-full gap-1 p-2 rounded-xl flex items-center justify-center text-center bg-green-500 text-white hover:shadow-lg transform transition-all duration-300 ease-in-out">
                <div class="i-mingcute:target-fill text-xl" />
                <span class="font-bold uppercase">Create Goal</span>
              </nuxt-link>
            </div>
          </div>
        </template>
      </div>
    </div>

    <template #aside>
      <aside-content ref="messageContainerRef">
        <div class="flex-1 w-full text-sm space-y-4" />
      </aside-content>
    </template>
  </layouts-with-aside>
</template>
