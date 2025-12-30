<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch, nextTick, computed } from 'vue';
import { useApiGoals, type IGoal } from '~/composables/api/goals';

// --------------------------
// ROUTE & USER VALIDATION
// --------------------------
const user = defineModel<IUser>('user');
if (!user.value) {
  throw createError({ statusCode: 404, statusMessage: 'User Not Found' });
}

// --------------------------
// STATE
// --------------------------
const totalGoals = defineModel<number>('total-goals', { default: 0 });
const goalsList = ref<IGoal[]>([]);
const currentPage = ref(1);
const pageSize = 1;
const hasMore = ref(true);
const isLoading = ref(false);

const sentinel = ref<HTMLElement | null>(null);
let observer: IntersectionObserver | null = null;

// --------------------------
// FETCH GOALS
// --------------------------
const apiGoals = useApiGoals();

const loadGoals = async () => {
  if (isLoading.value || !hasMore.value) return;

  isLoading.value = true;

  try {
    const res = await apiGoals.retrieveAllReactive({
      filter: { created_by_id: user.value?._id, visibility: 'public' },
      sort: '-created_at',
      page: currentPage.value,
      page_size: pageSize,
    });

    const payload = res?.data?.value;
    const items = payload?.data ?? [];
    const pagination = payload?.pagination;

    totalGoals.value = pagination?.total_document ?? 0;

    if (items.length) {
      goalsList.value.push(...items);
    }

    // pagination check
    hasMore.value = pagination
      ? pagination.page < pagination.page_count
      : items.length >= pageSize;
  } catch (err) {
    console.error('loadGoals error:', err);
  } finally {
    isLoading.value = false;
  }
};

// --------------------------
// RESET + INITIAL LOAD
// --------------------------
const resetAndLoad = async () => {
  currentPage.value = 1;
  goalsList.value = [];
  hasMore.value = true;
  await loadGoals();
};

// --------------------------
// OBSERVER
// --------------------------
const onIntersect: IntersectionObserverCallback = (entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting && hasMore.value && !isLoading.value) {
      currentPage.value++;
      loadGoals();
    }
  });
};

onMounted(async () => {
  if (!import.meta.client) return;

  await nextTick();

  observer = new IntersectionObserver(onIntersect, {
    rootMargin: '200px',
    threshold: 0.1,
  });

  if (sentinel.value) observer.observe(sentinel.value);
});

onUnmounted(() => {
  if (observer && sentinel.value) observer.unobserve(sentinel.value);
  observer = null;
});

// --------------------------
// INITIAL LOAD
// --------------------------
await resetAndLoad();
</script>

<template>
  <div class="relative max-w-full h-full lg:max-w-lg mx-auto">

    <card-goal
      v-for="goal in goalsList"
      :key="goal._id"
      :goal="goal"
    />

    <div v-if="isLoading" class="text-center py-4 text-slate-500">
      Loading more...
    </div>

    <div v-else-if="!hasMore && goalsList.length" class="text-center py-4 text-slate-400">
      No more goals
    </div>

    <div
      v-else-if="goalsList.length === 0"
      class="flex flex-col items-center justify-center text-center p-10 rounded-2xl shadow
             bg-white dark:bg-slate-900"
    >
      <h2 class="text-2xl font-semibold text-slate-900 dark:text-slate-100">
        No goals yet
      </h2>
      <p class="mt-2 text-slate-500 dark:text-slate-300 max-w-[36rem]">
        This user hasn't created any goals yet.
      </p>
    </div>

    <div ref="sentinel" class="w-full h-6" aria-hidden="true" />
  </div>
</template>
