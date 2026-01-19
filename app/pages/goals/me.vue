<script setup lang="ts">
import { ref, onMounted, onUnmounted, nextTick } from 'vue';
import { useApiGoals, type IGoal } from '~/composables/api/goals';

useHead({
  link: [{ rel: 'canonical', href: 'https://thinkaction.id/' }],
});

useSeoMeta({
  title: 'Thinkaction — Turn Ideas into Action',
  description: 'Join Thinkaction to share, track, and achieve your personal and community goals.',
  ogTitle: 'Thinkaction — Turn Ideas into Action',
  ogType: 'website',
  ogSiteName: 'Thinkaction',
  ogDescription: 'Join Thinkaction to share, track, and achieve your personal and community goals.',
  ogUrl: 'https://thinkaction.id/',
});

/* --------------------------
 * USER
 * -------------------------- */
const { user: myUser } = useAuth();

/* --------------------------
 * API
 * -------------------------- */
const apiGoals = useApiGoals();

/* --------------------------
 * STATE
 * -------------------------- */
const goalsList = ref<IGoal[]>([]);
const currentPage = ref(1);
const pageSize = 10;

const hasMore = ref(true);
const isLoading = ref(false);

const sentinel = ref<HTMLElement | null>(null);
let observer: IntersectionObserver | null = null;

/* --------------------------
 * FETCH GOALS
 * -------------------------- */
const loadGoals = async () => {
  if (isLoading.value || !hasMore.value) return;

  isLoading.value = true;

  try {
    const res = await apiGoals.retrieveAllReactive({
      sort: '-last_progress_at',
      page: currentPage.value,
      page_size: pageSize,
      filter: { created_by_id: myUser.value?._id },
    });

    const payload = res?.data?.value;
    const items = payload?.data ?? [];
    const pagination = payload?.pagination;

    if (items.length) {
      goalsList.value.push(...items);
    }

    hasMore.value = pagination
      ? pagination.page < pagination.page_count
      : items.length >= pageSize;
  } catch (err) {
    console.error('loadGoals error:', err);
  } finally {
    isLoading.value = false;
  }
};

/* --------------------------
 * RESET + INITIAL LOAD
 * -------------------------- */
const resetAndLoad = async () => {
  currentPage.value = 1;
  goalsList.value = [];
  hasMore.value = true;
  await loadGoals();
};

/* --------------------------
 * INTERSECTION OBSERVER
 * -------------------------- */
const onIntersect: IntersectionObserverCallback = (entries) => {
  entries.forEach(entry => {
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

/* --------------------------
 * INITIAL LOAD
 * -------------------------- */
await resetAndLoad();
</script>

<template>
  <layouts-with-aside aside-title="">
    <div class="relative max-w-lg max-h-svh mx-auto pb-20">

      <!-- GOALS -->
      <card-goal
        v-for="goal in goalsList"
        :key="goal._id"
        :goal="goal"
      />

      <!-- LOADING -->
      <div v-if="isLoading" class="text-center py-4 text-slate-500">
        Loading more goals…
      </div>

      <!-- END -->
      <div
        v-else-if="!hasMore && goalsList.length"
        class="text-center py-4 text-slate-400"
      >
        You’ve reached the end 🎉
      </div>

      <!-- EMPTY -->
      <div
        v-else-if="!goalsList.length && !isLoading"
        class="flex items-center justify-center h-full"
      >
        <div
          class="flex flex-col items-center justify-center text-center p-10 rounded-2xl
                 dark:bg-slate-900"
        >
          <h2 class="text-2xl font-extrabold text-slate-900 dark:text-slate-100">
            NO GOALS FOUND
          </h2>
          <p class="mt-2 text-slate-500 dark:text-slate-300 max-w-[36rem]">
            Be the first to create a goal and inspire others 🚀
          </p>
        </div>
      </div>

      <!-- SENTINEL -->
      <div ref="sentinel" class="w-full h-6" aria-hidden="true" />
    </div>

    <!-- ASIDE -->
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
