<script setup lang="ts">
import { useApiGoals, type IGoal } from '~/composables/api/goals';
import { ref, computed } from 'vue';
import { useApiCheers } from '~/composables/api/cheers';
import { useApiComments } from '~/composables/api/comments';

const config = useRuntimeConfig();
const appBaseURL = config.public.appBase;

const goal = defineModel<IGoal>('goal');

const { user: myUser } = useAuth();

/* Card Goal Action Menu Section */
const isMenuOpen = ref(false);
function toggleMenu() {
  isMenuOpen.value = !isMenuOpen.value;
}

/* Cheers Section */
const isProcessingCheer = ref(false);
const onCheer = async () => {
  if (isProcessingCheer.value) return;
  isProcessingCheer.value = true;

  if (goal.value == null) {
    isProcessingCheer.value = false;
    return;
  }

  // If already cheered, remove cheer
  if (goal.value.my_cheered_id) {
    await useApiCheers().remove(goal.value.my_cheered_id);
    goal.value = {
      ...goal.value,
      my_cheered_id: '',
      total_cheers: goal.value.total_cheers - 1,
    };
    isProcessingCheer.value = false;
    return;
  }

  const response = await useApiCheers().create({ goal_id: goal.value._id });
  goal.value = {
    ...goal.value,
    my_cheered_id: response.inserted_id,
    total_cheers: goal.value.total_cheers + 1,
  };
  isProcessingCheer.value = false;
};

/* Edit Goal Section */
function editGoal() {
  isMenuOpen.value = false;
}

/* Complete Goal Section */
const completeGoal = async () => {
  await useApiGoals().update(goal.value!._id as string, {
    status: 'achieved',
  });

  goal.value!.status = 'achieved';
  isMenuOpen.value = false;
  toast('Congratulations for achieving your goal.', { color: 'success' });
};

/* Delete Goal Section */
const isDeleted = ref(false);
const deleteGoal = async () => {
  const confirmed = window.confirm('Are you sure you want to delete this goal? This action cannot be undone.');
  if (!confirmed) return;

  await useApiGoals().remove(goal.value?._id as string);
  isMenuOpen.value = false;

  isDeleted.value = true;
};

/**
 * Comments Section
 */
const isCommentsModalOpen = ref(false);
const inputComment = ref('');
const isCommenting = ref(false);

const openCommentsModal = () => {
  isCommentsModalOpen.value = true;
};

const onComment = async () => {
  if (isCommenting.value) return;
  isCommenting.value = true;

  if (!goal.value) return;

  try {
    await useApiComments().create({
      goal_id: goal.value?._id,
      created_by_id: myUser.value?._id,
      comment: inputComment.value,
    });

    goal.value.comments.pop();
    goal.value.comments.unshift({
      goal_id: goal.value._id,
      comment: inputComment.value,
      created_by: myUser.value ?? undefined,
      created_at: new Date(),
    });

    goal.value.total_comments++;
    inputComment.value = '';
  } catch (error) {
    isCommenting.value = false;
  } finally {
    isCommenting.value = false;
  }
};

const onEnterComment = (e: KeyboardEvent) => {
  if (e.shiftKey) return;
  e.preventDefault();
  onComment();
};

/**
 * Share Section
 */
const isSharePopupOpen = ref(false); // State for the share popup

const openSharePopup = () => {
  isSharePopupOpen.value = true;
};

const closeSharePopup = () => {
  isSharePopupOpen.value = false;
};

const goalShareLink = computed(() => {
  if (!goal.value?._id) return '';
  return `${appBaseURL}/goals/${goal.value._id}`;
});
</script>

<template>
  <div v-if="!isDeleted" class="w-full">

    <div class="mb-2 lg:rounded-xl bg-white shadow-lg">
      <div class="p-4 flex items-center justify-between">
        <div class="flex items-center gap-3 cursor-pointer" @click="navigateTo(`/@${goal?.created_by?.username}`)">
          <avatar :user="goal?.created_by" />
          <div class="flex flex-col">
            <span class="font-semibold text-base">{{ goal?.created_by?.username }}</span>
            <span class="font-extralight text-xs">{{ goal?.created_by?.profile?.status }}</span>
          </div>
        </div>

        <div class="relative ml-auto">
          <!-- Dots button -->
          <div
            v-if="myUser?._id === goal?.created_by?._id"
            class="i-mdi-dots-vertical text-2xl cursor-pointer text-gray-500 hover:text-gray-900 transition-colors"
            @click="toggleMenu"
          />

          <!-- Dropdown menu -->
          <transition name="slide-down">
            <div
              v-if="isMenuOpen"
              class="absolute right-0 mt-2 w-48 rounded-md shadow-xl bg-white ring-1 ring-black ring-opacity-5 z-50"
              @click.stop
            >
              <div
                class="py-1"
                role="menu"
                aria-orientation="vertical"
                aria-labelledby="options-menu"
              >
                <button
                  v-if="myUser?._id === goal?.created_by?._id && goal?.status === 'in-progress'"
                  class="flex w-full items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                  role="menuitem"
                  @click="completeGoal"
                >
                  <span class="i-lucide:square-check-big w-4 h-4 mr-2" />
                  Complete Goal
                </button>
                <button
                  v-if="myUser?._id === goal?.created_by?._id"
                  class="flex w-full items-center px-4 py-2 text-sm text-red-600 hover:bg-red-50 hover:text-red-700"
                  role="menuitem"
                  @click="deleteGoal"
                >
                  <span class="i-lucide:trash-2 w-4 h-4 mr-2" />
                  Delete Goal
                </button>
              </div>
            </div>
          </transition>
        </div>

        <!-- BACKDROP (for click-outside) -->
        <div
          v-if="isMenuOpen"
          class="fixed inset-0 z-40"
          @click="isMenuOpen = false"
        />

      </div>

      <!-- Story Progress -->
      <card-goal-story v-model:goal="goal" />

      <!-- Goal Thumbnail -->
      <div class="w-full bg-gray-200 object-cover">
        <img :src="goal?.thumbnail_url" alt="">
      </div>

      <div
        v-if="goal?.status === 'achieved'"
        class="bg-gradient-to-r from-[#FFC107] via-[#FFE000] to-[#FFC107] lg:-mx-2
         py-2 px-4 text-center text-[#996515] flex items-center justify-center gap-2
         shadow-lg duration-300"
      >
        <span class="i-lets-icons:check-fill" />
        <span class="i-fa7-solid:glass-cheers" />
        <span class="i-gridicons:trophy" />
        <span class="font-bold uppercase tracking-wide">
          Achieved
        </span>
        <span class="i-gridicons:trophy" />
        <span class="i-fa7-solid:glass-cheers" />
        <span class="i-lets-icons:check-fill" />
      </div>

      <div
        v-if="goal?.status === 'failed'"
        class="bg-gradient-to-r from-[#CA0B00] via-[#F32013] to-[#CA0B00] lg:-mx-2
         py-2 px-4 text-center text-red-100 flex items-center justify-center gap-2
         shadow-lg duration-300"
      >
        <span class="i-jam:triangle-danger-f" />
        <span class="i-streamline-ultimate:smiley-wrong-bold" />
        <span class="i-ic:round-cancel" />
        <span class="font-bold uppercase tracking-wide">
          Failed
        </span>
        <span class="i-ic:round-cancel" />
        <span class="i-streamline-ultimate:smiley-wrong-bold" />
        <span class="i-jam:triangle-danger-f" />
      </div>

      <div class="p-4">
        <div class="flex gap-3 justify-between">
          <div class="flex gap-3">
            <!-- Cheers -->
            <div class="flex items-center gap-1">
              <div v-if="goal?.my_cheered_id" class="i-lucide:biceps-flexed text-3xl text-green-900 cursor-pointer transition-colors" @click="onCheer" />
              <div v-else class="i-lucide:biceps-flexed text-3xl cursor-pointer transition-colors" @click="onCheer" />
              <p class="font-lg">{{ formatShortNumber(goal?.total_cheers ?? 0) }}</p>
            </div>
            <!-- Comment -->
            <div class="flex items-center gap-1" @click="openCommentsModal">
              <div class="i-lucide:message-circle text-3xl cursor-pointer" />
              <p class="font-lg">{{ formatShortNumber(goal?.total_comments ?? 0) }}</p>
            </div>
            <!-- Share -->
            <div class="flex items-center gap-1">
              <div class="i-fa7-regular:share-alt text-3xl cursor-pointer" @click="openSharePopup" />
            </div>
          </div>
          <div>
            <!-- Timeleft -->
            <div v-if="goal?.status === 'in-progress'" class="flex items-center gap-1">
              <div class="bg-green-300 py-1 px-4 rounded-full text-xs">
                <client-only>{{ dateLeft(goal?.time) }}</client-only>
              </div>
            </div>
          </div>
        </div>
        <div class="text-sm mt-4">
          <p class="flex flex-col mt-1">
            <span class="font-semibold text-xs text-gray-400">Next week, I want to</span>
            <span class="whitespace-pre-wrap">{{ goal?.specific }}</span>
          </p>
          <p class="flex flex-col mt-1">
            <span class="font-semibold text-xs text-gray-400">I'll know it's done if</span>
            <span class="whitespace-pre-wrap">{{ goal?.measurable }}</span>
          </p>
          <p class="flex flex-col mt-1">
            <span class="font-semibold text-xs text-gray-400">This matters to me because</span>
            <span class="whitespace-pre-wrap">{{ goal?.relevant }}</span>
          </p>
          <p class="flex flex-col mt-1">
            <span class="font-semibold text-xs text-gray-400">Things I need to do to achieve this:</span>
            <span class="whitespace-pre-wrap">{{ goal?.achievable }}</span>
          </p>
        </div>

        <div class="text-sm border-t border-gray-200 mt-2 flex flex-col gap-2">
          <p v-if="goal?.comments?.length || myUser" class="mt-2 text-slate-900 font-bold">Comments</p>
          <div v-for="comment in goal?.comments" :key="comment._id" class="flex items-start gap-2">
            <avatar :size="24" :user="comment.created_by" />
            <div class="flex flex-col">
              <p class="space-x-1">
                <span class="font-semibold">{{ comment.created_by?.username }}</span>
                <span class="text-slate-700 whitespace-pre-wrap">{{ comment.comment }}</span>
              </p>

              <span class="text-xs text-slate-400">
                <client-only>{{ timeAgo(comment.created_at) }}</client-only>
              </span>
            </div>
          </div>
          <p
            v-if="goal && goal.total_comments > 1"
            class="text-xs text-gray-500 mt-2 cursor-pointer"
            @click="openCommentsModal"
          >
            View all {{ goal.total_comments }} comments
          </p>
        </div>
        <form v-if="myUser" class="flex justify-between gap-2" @submit.prevent="onComment">
          <base-mention v-model="inputComment" class="flex-1" placeholder="Add a comment..." @keydown.enter="onEnterComment" />
          <div class="self-end">
            <base-button type="submit" variant="text" color="primary">
              <span class="text-xs">POST</span>
            </base-button>
          </div>
        </form>
      </div>
    </div>

    <goal-comments v-model:goal="goal" v-model:is-open="isCommentsModalOpen" />
    <goal-share :is-open="isSharePopupOpen" :goal-link="goalShareLink" @close="closeSharePopup" />
  </div>
</template>
